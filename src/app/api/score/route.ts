import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

import {
  transcriptMessageSchema,
  geminiPrompt,
  safeParseAnalysis,
} from "@/lib/rubric";
import { getSupabaseServiceClient } from "@/lib/supabase";
import type { GeminiAnalysis, QuestionKey, TranscriptMessage } from "@/types/interview";

const requestSchema = z.object({
  transcript: z.array(transcriptMessageSchema).min(1),
  sessionId: z.string().uuid().optional(),
  agentId: z.string().optional(),
  candidateName: z.string().optional(),
  candidateEmail: z.string().email().optional(),
  summary: z.string().optional(),
  provider: z.enum(["openai", "anthropic"]).optional(),
  questionKey: z
    .enum([
      "q1_attracts",
      "q2_concerns",
      "q3_questions",
      "q4_direct_skills",
      "q5_improve_skills",
      "q6_connect",
    ])
    .optional(),
});

type ScoreResult = {
  analysis: GeminiAnalysis;
  modelUsed: string;
  usedFallback: boolean;
  rawText?: string;
};

// New table names to keep reflection data isolated from the voice interview app
const SESSION_TABLE = "reflection_sessions";
const SCORE_TABLE = "reflection_scores";

async function analyzeWithOpenAI(
  transcript: TranscriptMessage[],
  summary: string | undefined,
  questionKey?: QuestionKey
): Promise<ScoreResult> {
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.LLM_API_KEY;
  const model = process.env.OPENAI_MODEL ?? process.env.LLM_MODEL ?? "set-openai-model-in-env";

  if (!apiKey) {
    return {
      analysis: safeParseAnalysis("{}"),
      modelUsed: "fallback-missing-openai-key",
      usedFallback: true,
    };
  }

  const client = new OpenAI({ apiKey });
  const prompt = geminiPrompt(transcript, summary, questionKey);

  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0,
  });

  const text = completion.choices[0]?.message?.content ?? "";
  const parsed = safeParseAnalysis(text);

  return {
    analysis: parsed,
    modelUsed: model,
    usedFallback: Boolean(parsed.rawText),
    rawText: text,
  };
}

async function analyzeWithAnthropic(
  transcript: TranscriptMessage[],
  summary: string | undefined,
  questionKey?: QuestionKey
): Promise<ScoreResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL ?? "set-anthropic-model-in-env";

  if (!apiKey) {
    return {
      analysis: safeParseAnalysis("{}"),
      modelUsed: "fallback-missing-anthropic-key",
      usedFallback: true,
    };
  }

  const anthropic = new Anthropic({ apiKey });
  const prompt = geminiPrompt(transcript, summary, questionKey);

  const resp = await anthropic.messages.create({
    model,
    max_tokens: 1024,
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    resp.content.find((part) => part.type === "text")?.text ?? "";
  const parsed = safeParseAnalysis(text);

  return {
    analysis: parsed,
    modelUsed: model,
    usedFallback: Boolean(parsed.rawText),
    rawText: text,
  };
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = requestSchema.safeParse(json);

    if (!payload.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: payload.error.flatten() },
        { status: 400 }
      );
    }

    const { transcript, sessionId, agentId, candidateName, candidateEmail, summary, provider, questionKey } =
      payload.data as {
        transcript: TranscriptMessage[];
        sessionId?: string;
        agentId?: string;
        candidateName?: string;
        candidateEmail?: string;
        summary?: string;
        provider?: "openai" | "anthropic";
        questionKey?: QuestionKey;
      };

    const filteredTranscript: TranscriptMessage[] = questionKey
      ? transcript.filter((msg) => msg.questionKey === questionKey && Boolean(msg.id && msg.message))
      : transcript;

    const providerChoice =
      provider ?? process.env.DEFAULT_MODEL_PROVIDER ?? "anthropic";

    const runner = (
      providerChoice === "openai"
        ? analyzeWithOpenAI
        : analyzeWithAnthropic
    );

    const transcriptForScoring = filteredTranscript.length ? filteredTranscript : transcript;

    let analysis: GeminiAnalysis;
    let modelUsed: string;
    let usedFallback: boolean;
    let rawText: string | undefined;

    try {
      const result = await runner(transcriptForScoring, summary, questionKey);
      analysis = result.analysis;
      modelUsed = result.modelUsed;
      usedFallback = result.usedFallback;
      rawText = result.rawText;
    } catch (err) {
      // Fallback to OpenAI if Anthropic path fails.
      if (providerChoice !== "anthropic") {
        throw err;
      }
      const fallback = await analyzeWithOpenAI(transcriptForScoring, summary, questionKey);
      analysis = fallback.analysis;
      modelUsed = `${fallback.modelUsed} (fallback from anthropic error)`;
      usedFallback = true;
      rawText = fallback.rawText;
    }

    // Normalize: if scoring a single question, blank out the others to avoid hallucinated scores
    const normalized: GeminiAnalysis = {
      ...analysis,
      questions: { ...analysis.questions },
    };
    if (questionKey) {
      const defaultQuestion = () => ({
        score_content: 0,
        score_communication_clarity: 0,
        score_conciseness_efficiency: 0,
        score_specificity: 0,
        strengths: [] as string[],
        weaknesses: [] as string[],
      });

      const keys: QuestionKey[] = [
        "q1_attracts",
        "q2_concerns",
        "q3_questions",
        "q4_direct_skills",
        "q5_improve_skills",
        "q6_connect",
      ];

      for (const key of keys) {
        if (key !== questionKey) {
          normalized.questions[key] = defaultQuestion();
        }
      }

      // If we had no transcript for this question, also zero out the target question.
      if (!filteredTranscript.length) {
        normalized.questions[questionKey] = defaultQuestion();
      }
    }

    let supabaseSaved = false;
    let sessionIdentifier = sessionId ?? null;

    try {
      const supabase = getSupabaseServiceClient();

      // Upsert session into reflection-specific table
      if (!sessionIdentifier) {
        const { data, error } = await supabase
          .from(SESSION_TABLE)
          .insert({
            agent_id: agentId ?? null,
            candidate_name: candidateName ?? null,
            candidate_email: candidateEmail ?? null,
            transcript,
          })
          .select()
          .maybeSingle();

        if (error) {
          throw error;
        }

        sessionIdentifier = data?.id ?? null;
      } else {
        await supabase
          .from(SESSION_TABLE)
          .update({
            transcript,
            agent_id: agentId ?? null,
            candidate_name: candidateName ?? null,
            candidate_email: candidateEmail ?? null,
          })
          .eq("id", sessionIdentifier);
      }

      if (sessionIdentifier) {
        const { error: scoreError } = await supabase
          .from(SCORE_TABLE)
          .insert({
            session_id: sessionIdentifier,
            rubric_version: "cre-career-path-rubric-v1",
            scores: analysis,
            total: null,
            model_used: modelUsed,
            reasoning: rawText ?? null,
          });

        if (scoreError) {
          throw scoreError;
        }
      }

      supabaseSaved = true;
    } catch (err) {
      console.warn("Supabase write skipped or failed:", err);
    }

    return NextResponse.json({
      sessionId: sessionIdentifier,
      scores: normalized,
      modelUsed,
      usedFallback,
      supabaseSaved,
    });
  } catch (error) {
    console.error("Score route error", error);
    return NextResponse.json(
      { error: "Failed to score transcript" },
      { status: 500 }
    );
  }
}
