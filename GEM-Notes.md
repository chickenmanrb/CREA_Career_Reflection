i want to create a very similar app to this one, but instead of voice to voice i want the user to just write their answers https://github.com/chickenmanrb/CREA_Acquisitions_Mock_Interview



there are 6 questions, i have prepared 6 other voice agents

question 1 https://elevenlabs.io/app/talk-to?agent_id=agent_9301kb17m8qafjz81fzh3xed32gw

What attracts you to this pathway?



question 2 https://elevenlabs.io/app/agents/agents/agent_3001kb17yts2ez6tmp7h6yczfeej

What concerns you about this pathway?



question 3 https://elevenlabs.io/app/agents/agents/agent_4101kb18epgrfpd8fthhywkwc5vh

What questions and curiosities do you have?



question 4 https://elevenlabs.io/app/agents/agents/agent_2101kb18g7gtesyv4319ybbppf6y

What skills or traits do you have that directly apply?



question 5 https://elevenlabs.io/app/agents/agents/agent_4301kb18hc1mfvz9qwrw5k5acnry

What skills or traits do you need to improve on?



question 6 https://elevenlabs.io/app/agents/agents/agent_7001kb18jpckevg876ah1m4472hc

Who can you connect with to learn about this path?

This is a great idea for adapting the existing voice interview app into a text-based format. This requires modifying several files to update the interview flow, question configuration, scoring logic, and the user interface to replace the voice components with a text input area.

Here are the changes for the 7 files required to implement the new 6-question, text-only flow.

1. src/types/interview.ts
Update the QuestionKey type to reflect the 6 new questions.

TypeScript
// File: src/types/interview.ts

export type MessageSource = "user" | "ai";

export interface TranscriptMessage {
  id: string;
  source: MessageSource;
  message: string;
  timestamp?: string;
  stepId?: string;
  questionKey?: QuestionKey;
}

export type QuestionKey =
  | "q1_attracts"
  | "q2_concerns"
  | "q3_questions"
  | "q4_direct_skills"
  | "q5_improve_skills"
  | "q6_connect"; // UPDATED FOR 6 NEW QUESTIONS

export interface QuestionScore {
  score_content: number;
  score_communication_clarity: number;
  score_conciseness_efficiency: number;
  score_specificity: number;
  strengths: string[];
  weaknesses: string[];
}

export interface GeminiAnalysis {
  questions: Record<QuestionKey, QuestionScore>;
  rawText?: string; // stored when JSON parse fails but content is returned
}
2. src/lib/rubric.ts
Update the analysisSchema, geminiPrompt (with new expectations), and rubricDimensions to reflect the 6 new questions.

TypeScript
// File: src/lib/rubric.ts

import { z } from "zod";

import type { GeminiAnalysis, QuestionKey, TranscriptMessage } from "@/types/interview";

export const transcriptMessageSchema = z.object({
  id: z.string().min(1),
  source: z.enum(["user", "ai"]),
  message: z.string().min(1),
  timestamp: z.string().optional(),
  stepId: z.string().optional(),
  questionKey: z
    .enum([
      "q1_attracts", // UPDATED
      "q2_concerns", // UPDATED
      "q3_questions", // UPDATED
      "q4_direct_skills", // UPDATED
      "q5_improve_skills", // UPDATED
      "q6_connect", // UPDATED
    ])
    .optional(),
});

// Helper for generating the full QuestionScore schema object
const QuestionScoreSchema = z.object({
  score_content: z.coerce.number(),
  score_communication_clarity: z.coerce.number(),
  score_conciseness_efficiency: z.coerce.number(),
  score_specificity: z.coerce.number(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
});

export const analysisSchema = z.object({
  questions: z.object({
    q1_attracts: QuestionScoreSchema, // UPDATED
    q2_concerns: QuestionScoreSchema, // UPDATED
    q3_questions: QuestionScoreSchema, // UPDATED
    q4_direct_skills: QuestionScoreSchema, // UPDATED
    q5_improve_skills: QuestionScoreSchema, // UPDATED
    q6_connect: QuestionScoreSchema, // UPDATED
  }),
});

export type AnalysisPayload = z.infer<typeof analysisSchema>;

export const geminiPrompt = (transcript: TranscriptMessage[], summary?: string, questionKey?: string) => {
  const transcriptText = transcript
    .map((msg) => {
      const speaker = msg.source === "ai" ? "Interviewer" : "Candidate";
      return `${speaker}: ${msg.message}`;
    })
    .join("\n");

  return `
You are a job interview coach scoring a mock interview. Score *one question at a time* when a questionKey is provided. Only score the supplied question; leave all other questions at 0 with empty strengths/weaknesses.

When writing strengths or weaknesses, cite specific evidence from the candidate's answer. Pull in short quotes or paraphrased snippets from the transcript (e.g., "Mentioned cap rates tightening to 5.5%") so the candidate can see exactly what to repeat or fix.

Scoring system (use numbers 1–10):
8–10 = strongly meets criteria
4–6 = partially meets criteria
1-3 = poor performance

Return strict JSON matching exactly:
{
  "questions": {
    "q1_attracts": {
      "score_content": 0,
      "score_communication_clarity": 0,
      "score_conciseness_efficiency": 0,
      "score_specificity": 0,
      "strengths": [],
      "weaknesses": []
    },
    "q2_concerns": {
      "score_content": 0,
      "score_communication_clarity": 0,
      "score_conciseness_efficiency": 0,
      "score_specificity": 0,
      "strengths": [],
      "weaknesses": []
    },
    "q3_questions": {
      "score_content": 0,
      "score_communication_clarity": 0,
      "score_conciseness_efficiency": 0,
      "score_specificity": 0,
      "strengths": [],
      "weaknesses": []
    },
    "q4_direct_skills": {
      "score_content": 0,
      "score_communication_clarity": 0,
      "score_conciseness_efficiency": 0,
      "score_specificity": 0,
      "strengths": [],
      "weaknesses": []
    },
    "q5_improve_skills": {
      "score_content": 0,
      "score_communication_clarity": 0,
      "score_conciseness_efficiency": 0,
      "score_specificity": 0,
      "strengths": [],
      "weaknesses": []
    },
    "q6_connect": {
      "score_content": 0,
      "score_communication_clarity": 0,
      "score_conciseness_efficiency": 0,
      "score_specificity": 0,
      "strengths": [],
      "weaknesses": []
    }
  }
}

# Transcript:
${transcriptText}

# Summary (if provided):
${summary ?? "N/A"}

Question to score (questionKey): ${questionKey ?? "all (if provided) but only score the provided key"}

# Field Definitions per question:
- score_content: quality and correctness of the answer for this question.
- score_communication_clarity: structure, organization, and clarity for this question.
- score_conciseness_efficiency: brevity and efficiency for this question.
- score_specificity: relevance and concreteness of details for this question.
- strengths: 2–4 concise bullet strings about what went well for this question and each bullet should reference a concrete quote or detail from the transcript.
- weaknesses: 2–4 concise bullet strings about what to improve for this question and each bullet should reference the specific phrase or section that needs work.

Question-specific content expectations:
- q1_attracts: Genuine and thoughtful reasons for pursuing the pathway, aligning with core values and long-term goals.
- q2_concerns: Self-aware and constructive articulation of potential challenges or risks, showing mitigation strategies.
- q3_questions: Quality of questions and curiosities asked, demonstrating deep research and intellectual curiosity about the role or industry.
- q4_direct_skills: Clear, concise examples of direct skills/traits (hard or soft) that immediately apply to the new role.
- q5_improve_skills: Honest and specific identification of areas for development, linked to a concrete plan for improvement.
- q6_connect: Strategic and appropriate networking targets or methods that align with the pathway.
`;
};

// ... joinTranscript and safeParseAnalysis functions remain the same (using new keys)

export const rubricDimensions = [
  {
    key: "q1_attracts",
    label: "Attraction to pathway",
    detail:
      "Genuine and thoughtful reasons for pursuing the pathway, aligning with core values and long-term goals.",
  },
  {
    key: "q2_concerns",
    label: "Concerns/Risks",
    detail:
      "Self-aware and constructive articulation of potential challenges or risks, showing mitigation strategies.",
  },
  {
    key: "q3_questions",
    label: "Questions/Curiosities",
    detail:
      "Quality of questions and curiosities asked, demonstrating deep research and intellectual curiosity about the role or industry.",
  },
  {
    key: "q4_direct_skills",
    label: "Directly Applicable Skills",
    detail:
      "Clear, concise examples of direct skills/traits (hard or soft) that immediately apply to the new role.",
  },
  {
    key: "q5_improve_skills",
    label: "Improvement Areas",
    detail:
      "Honest and specific identification of areas for development, linked to a concrete plan for improvement.",
  },
  {
    key: "q6_connect",
    label: "Networking Strategy",
    detail:
      "Strategic and appropriate networking targets or methods that align with the pathway.",
  },
] as const;
3. src/lib/flow-config.ts
Replace the original 4 questions (Prep, Agent, Review) with 6 new questions, updating the agent IDs and content. I am keeping the original structure of (Prep -> Agent -> Review) for each question. I also updated the final-review step to be the 14th element, matching the number of steps (3 steps * 6 questions + 2 original steps = 20 total, but you only show Prep/Agent/Review for each question, which is 3 steps, so 6 * 3 + 1 Intro step + 1 Final Review step = 20 steps). The flowConfig array is 20 elements long.

I will use the full list of steps (20 total, with "Intro" and "Final Review" being the first and last steps) to ensure the navigation works correctly. The numbering in the original file was incorrect (4 questions had 12 steps, plus 1 intro and 1 final was 14 total steps, but the example file had 14 steps for 4 questions). Since you want 6 questions, there will be 18 steps for Q&A, plus 2 review steps, for a total of 20 steps.

The provided src/lib/flow-config.ts had 16 steps total (1 Intro + 4 Q3 steps + 1 Final Review). I will adjust for 6 questions (1 Intro + 6 Q3 steps + 1 Final Review = 20 steps total).

TypeScript
// File: src/lib/flow-config.ts

import type { MultiAgentConfig } from "@/types/flow";
import { DEFAULT_HARD_STOP_MS, DEFAULT_SOFT_WARNING_MS, DEFAULT_WRAP_LINE } from "@/lib/time-limit";

// Placeholder flow for 6 questions (Intro + 6x(Prep/Agent/Review) + Final Review = 20 steps)
export const flowConfig: MultiAgentConfig = {
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Introduction and Instruction",
      subtitle: "Meet Your AI Interview Coach",
      description:
        "Practice common interview questions in a realistic text simulation and receive detailed, personalized feedback on your written responses. This version uses text input instead of voice-to-voice conversation. The scoring mechanism evaluates your answers and provides specific guidance to strengthen your communication, technical knowledge, and overall approach.",
      videoUrl: "",
    },
    // --- Question 1 ---
    {
      id: "q1-prep",
      type: "question",
      title: "1 - What Attracts You?",
      description: "Question prep.",
      questionText:
        "What attracts you to this pathway?",
    },
    {
      id: "q1-agent",
      type: "agent", // NOTE: KEEP 'agent' type for scoring API, but it will be handled as text input
      title: "Live Answer",
      agentId: "agent_9301kb17m8qafjz81fzh3xed32gw", // UPDATED AGENT ID
      description: "Live answer with Agent 1",
      questionText:
        "What attracts you to this pathway?",
      softWarningMs: DEFAULT_SOFT_WARNING_MS, // Retain default timing config, though functionally unused in text mode
      hardStopMs: DEFAULT_HARD_STOP_MS,
      wrapUpLine: DEFAULT_WRAP_LINE,
    },
    {
      id: "q1-review",
      type: "review",
      title: "Debrief",
      description: "Scoring and review for Agent 1 conversation.",
    },
    // --- Question 2 ---
    {
      id: "q2-prep",
      type: "question",
      title: "2 - What Concerns You?",
      description: "Question prep.",
      questionText: "What concerns you about this pathway?",
    },
    {
      id: "q2-agent",
      type: "agent",
      title: "Talk To Your AI Interview Coach",
      agentId: "agent_3001kb17yts2ez6tmp7h6yczfeej", // UPDATED AGENT ID
      description: "Live answer with Agent 2",
      questionText: "What concerns you about this pathway?",
      softWarningMs: DEFAULT_SOFT_WARNING_MS,
      hardStopMs: DEFAULT_HARD_STOP_MS,
      wrapUpLine: DEFAULT_WRAP_LINE,
    },
    {
      id: "q2-review",
      type: "review",
      title: "Analyze Your Answer",
      description: "Scoring and review for Agent 2 conversation.",
    },
    // --- Question 3 ---
    {
      id: "q3-prep",
      type: "question",
      title: "3 - What Questions/Curiosities Do You Have?",
      description: "Prep content.",
      questionText: "What questions and curiosities do you have?",
    },
    {
      id: "q3-agent",
      type: "agent",
      title: "Talk To Your AI Interview Coach",
      agentId: "agent_4101kb18epgrfpd8fthhywkwc5vh", // UPDATED AGENT ID
      description: "Live answer with Agent 3",
      questionText: "What questions and curiosities do you have?",
      softWarningMs: DEFAULT_SOFT_WARNING_MS,
      hardStopMs: DEFAULT_HARD_STOP_MS,
      wrapUpLine: DEFAULT_WRAP_LINE,
    },
    {
      id: "q3-review",
      type: "review",
      title: "Analyze Your Answer",
      description: "Scoring and review for Agent 3 conversation.",
    },
    // --- Question 4 ---
    {
      id: "q4-prep",
      type: "question",
      title: "4 - Directly Applicable Skills",
      description: "Prep content.",
      questionText: "What skills or traits do you have that directly apply?",
    },
    {
      id: "q4-agent",
      type: "agent",
      title: "Talk To Your AI Interview Coach",
      agentId: "agent_2101kb18g7gtesyv4319ybbppf6y", // UPDATED AGENT ID
      description: "Live answer with Agent 4",
      questionText: "What skills or traits do you have that directly apply?",
      softWarningMs: DEFAULT_SOFT_WARNING_MS,
      hardStopMs: DEFAULT_HARD_STOP_MS,
      wrapUpLine: DEFAULT_WRAP_LINE,
    },
    {
      id: "q4-review",
      type: "review",
      title: "Analyze Your Answer",
      description: "Scoring and review for Agent 4 conversation.",
    },
    // --- Question 5 ---
    {
      id: "q5-prep",
      type: "question",
      title: "5 - Areas for Improvement",
      description: "Prep content.",
      questionText: "What skills or traits do you need to improve on?",
    },
    {
      id: "q5-agent",
      type: "agent",
      title: "Talk To Your AI Interview Coach",
      agentId: "agent_4301kb18hc1mfvz9qwrw5k5acnry", // UPDATED AGENT ID
      description: "Live answer with Agent 5",
      questionText: "What skills or traits do you need to improve on?",
      softWarningMs: DEFAULT_SOFT_WARNING_MS,
      hardStopMs: DEFAULT_HARD_STOP_MS,
      wrapUpLine: DEFAULT_WRAP_LINE,
    },
    {
      id: "q5-review",
      type: "review",
      title: "Analyze Your Answer",
      description: "Scoring and review for Agent 5 conversation.",
    },
    // --- Question 6 ---
    {
      id: "q6-prep",
      type: "question",
      title: "6 - Networking Strategy",
      description: "Prep content.",
      questionText: "Who can you connect with to learn about this path?",
    },
    {
      id: "q6-agent",
      type: "agent",
      title: "Talk To Your AI Interview Coach",
      agentId: "agent_7001kb18jpckevg876ah1m4472hc", // UPDATED AGENT ID
      description: "Live answer with Agent 6",
      questionText: "Who can you connect with to learn about this path?",
      softWarningMs: DEFAULT_SOFT_WARNING_MS,
      hardStopMs: DEFAULT_HARD_STOP_MS,
      wrapUpLine: DEFAULT_WRAP_LINE,
    },
    {
      id: "q6-review",
      type: "review",
      title: "Analyze Your Answer",
      description: "Scoring and review for Agent 6 conversation.",
    },
    // --- Final Review ---
    {
      id: "final-review",
      type: "review",
      title: "7 - Review Interview Feedback",
      description: "",
    },
  ],
};
4. src/app/interview/page.tsx
Update the questionKeyFromStepId function, the AGENT_ID constant (it's no longer necessary, but best to set it to an empty string to avoid accidental use), and the emptyScore initialization.

TypeScript
// File: src/app/interview/page.tsx

"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";

import { StepRenderer } from "@/components/interview/StepRenderer";
import { LeftNav } from "@/components/layout/LeftNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { flowConfig } from "@/lib/flow-config";
import type { GeminiAnalysis, QuestionKey, TranscriptMessage } from "@/types/interview";

function questionKeyFromStepId(stepId: string): QuestionKey | undefined {
  const match = stepId.match(/^q(\d)-/);
  if (!match) return undefined;
  const num = match[1];
  // UPDATED TO HANDLE 6 QUESTIONS
  if (num === "1") return "q1_attracts";
  if (num === "2") return "q2_concerns";
  if (num === "3") return "q3_questions";
  if (num === "4") return "q4_direct_skills";
  if (num === "5") return "q5_improve_skills";
  if (num === "6") return "q6_connect";
  return undefined;
}

// Set to empty string since we are no longer using the ElevenLabs SDK/Convo Bar directly.
// The Agent IDs are now only used in the flow-config and passed through the score API.
const AGENT_ID = ""; // UPDATED

function emptyScore(): GeminiAnalysis {
  const base = {
    score_content: 0,
    score_communication_clarity: 0,
    score_conciseness_efficiency: 0,
    score_specificity: 0,
    strengths: [] as string[],
    weaknesses: [] as string[],
  };
  return {
    questions: {
      // UPDATED KEYS
      q1_attracts: { ...base },
      q2_concerns: { ...base },
      q3_questions: { ...base },
      q4_direct_skills: { ...base },
      q5_improve_skills: { ...base },
      q6_connect: { ...base },
    },
  };
}

export default function InterviewPage() {
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [score, setScore] = useState<GeminiAnalysis | null>(null);
  const [loadingScore, setLoadingScore] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [provider, setProvider] = useState<"openai" | "anthropic">("anthropic");
  const [currentStepId, setCurrentStepId] = useState<string>(flowConfig.steps[0]?.id ?? "");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");

  useEffect(() => {
    const storedName = typeof window !== "undefined" ? localStorage.getItem("crea_candidate_name") : "";
    const storedEmail = typeof window !== "undefined" ? localStorage.getItem("crea_candidate_email") : "";
    if (storedName) setCandidateName(storedName);
    if (storedEmail) setCandidateEmail(storedEmail);
  }, []);

  // Check if we have any Agent IDs configured in flow-config for the new steps
  const agentConfigured = flowConfig.steps.some(s => s.type === "agent" && s.agentId.length > 0); // UPDATED logic to use flowConfig

  const handleMessage = (message: { source: "user" | "ai"; message: string }) => {
    const questionKey = questionKeyFromStepId(currentStepId);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        source: message.source,
        message: message.message,
        timestamp: new Date().toLocaleTimeString(),
        stepId: currentStepId,
        questionKey,
      },
    ]);
  };

  const handleScore = async () => {
    if (messages.length === 0) {
      setStatus("Transcript is empty. Enter an answer and send it first.");
      return;
    }

    setStatus(null);
    setLoadingScore(true);

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: messages,
          // Since the mock interview is text-only now, the agentId passed here
          // for DB logging/tracking purposes should be the ID associated with the
          // current step. We look it up from the currentStep object.
          agentId: currentStep.agentId, 
          candidateName,
          candidateEmail,
          provider,
          questionKey: questionKeyFromStepId(currentStepId),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to score transcript");
      }

      const result: GeminiAnalysis = data.scores;
      const questionKey = questionKeyFromStepId(currentStepId);

      // If scoring a single question, merge into aggregate score object.
      if (questionKey) {
        setScore((prev) => {
          const base = prev ?? emptyScore();
          return {
            questions: {
              ...base.questions,
              [questionKey]: result.questions[questionKey],
            },
          };
        });
      } else {
        setScore(result);
      }
      setStatus("Scored successfully.");
    } catch (error) {
      console.error(error);
      setStatus(
        error instanceof Error ? error.message : "Unable to score transcript."
      );
    } finally {
      setLoadingScore(false);
    }
  };

  const currentStep = useMemo(
    () => flowConfig.steps.find((s) => s.id === currentStepId) ?? flowConfig.steps[0],
    [currentStepId]
  );

  const stepsForNav = useMemo(() => flowConfig.steps, []);
  const currentIdx = Math.max(0, stepsForNav.findIndex((s) => s.id === currentStepId));
  const goPrev = () => {
    if (currentIdx > 0) {
      setCurrentStepId(stepsForNav[currentIdx - 1].id);
    }
  };

  const goNext = () => {
    if (currentIdx < stepsForNav.length - 1) {
      setCurrentStepId(stepsForNav[currentIdx + 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <header className="flex items-center justify-between bg-[#0f1729] px-5 py-3 text-white shadow">
        <div className="flex items-center gap-3">
          <Image src="/assets/CRE logo.webp" alt="CRE Analyst" width={120} height={32} className="h-8 w-auto" />
          <div className="text-sm font-semibold tracking-wide">Acquisitions Mock Interview</div>
        </div>
        <div className="text-xs font-semibold text-white/80">creanalyst.com</div>
      </header>

      <div className="flex min-h-[calc(100vh-56px)]">
        <LeftNav steps={stepsForNav} currentId={currentStep.id} onSelect={setCurrentStepId} />
    <main className="flex-1 overflow-y-auto px-8 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Acquisitions Mock Interview</h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            Three steps to each question: 1) Prep 2) Live Answer 3) Scoring & Feedback.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <button
                  onClick={goPrev}
                  className="rounded-full border px-3 py-2 text-xs font-semibold hover:bg-muted disabled:opacity-40"
                  disabled={currentIdx === 0}
                >
                  Previous
                </button>
                <span className="text-foreground font-semibold">
                  {/* UPDATE: Change to dynamic question number based on flow-config length */}
                  Step {currentIdx + 1} of {stepsForNav.length}
                </span>
                <button
                  onClick={goNext}
                  className="rounded-full border px-3 py-2 text-xs font-semibold hover:bg-muted disabled:opacity-40"
                  disabled={currentIdx === stepsForNav.length - 1}
                >
                  Next
                </button>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-medium text-foreground">
                <label className="flex items-center gap-2">
                  Model provider
                  <select
                    className="rounded-md border px-2 py-1 text-xs"
                    value={provider}
                    onChange={(e) =>
                      setProvider(e.target.value === "anthropic" ? "anthropic" : "openai")
                    }
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Claude</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          {!agentConfigured && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-dashed bg-amber-50 p-4 text-amber-900">
              <AlertCircle className="h-5 w-5" />
              <div className="text-sm">
                Warning: Agent IDs are missing for some of your interview steps, but scoring should still work for static text entries.
              </div>
            </div>
          )}

          <Card className="border border-primary/10 bg-gradient-to-br from-primary/5 to-background">
            {currentStep?.type === "agent" ? (
              <CardHeader>
                <CardTitle>
                  Live Answer — {currentStep.questionText || "Restate the question"}
                </CardTitle>
              </CardHeader>
            ) : currentStep?.type !== "question" && currentStep?.id !== "final-review" && currentStep?.type !== "intro" ? (
              <CardHeader>
                <CardTitle>{currentStep?.title}</CardTitle>
                <CardDescription>{currentStep?.description}</CardDescription>
              </CardHeader>
            ) : null}
            <CardContent className="space-y-6">
              <StepRenderer
                step={currentStep}
                messages={messages}
                score={score}
                loadingScore={loadingScore}
                status={status}
                onMessage={handleMessage}
              onScore={handleScore}
              onClear={() => {
                setMessages([]);
                setScore(emptyScore());
              }}
              onAdvance={goNext}
              provider={provider}
            />
            </CardContent>
          </Card>

        </main>
      </div>
    </div>
  );
}

5. src/app/api/score/route.ts
Update the QuestionKey enums in the requestSchema and the keys array in the POST handler to support the new 6 questions.

TypeScript
// File: src/app/api/score/route.ts

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
      // UPDATED KEYS
      "q1_attracts",
      "q2_concerns",
      "q3_questions",
      "q4_direct_skills",
      "q5_improve_skills",
      "q6_connect",
    ])
    .optional(),
});
// ... analyzeWithOpenAI and analyzeWithAnthropic functions remain the same

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
        // UPDATED KEYS
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

    // ... Supabase logic remains the same
    try {
      const supabase = getSupabaseServiceClient();

      // Upsert session
      if (!sessionIdentifier) {
        const { data, error } = await supabase
          .from("interview_sessions")
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
          .from("interview_sessions")
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
          .from("interview_scores")
          .insert({
            session_id: sessionIdentifier,
            rubric_version: "cre-acq-rubric-v1",
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

6. src/components/interview/ScoreCard.tsx
Update the question labels and ordered keys.

TypeScript
// File: src/components/interview/ScoreCard.tsx

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeminiAnalysis, QuestionKey } from "@/types/interview";

type ScoreCardProps = {
  score: GeminiAnalysis | null;
  loading?: boolean;
  questionKey?: QuestionKey;
  showAll?: boolean;
};

export function ScoreCard({ score, loading, questionKey, showAll = true }: ScoreCardProps) {
  const questionLabels: Record<string, string> = {
    // UPDATED LABELS
    q1_attracts: "Attraction to pathway",
    q2_concerns: "Concerns/Risks",
    q3_questions: "Questions/Curiosities",
    q4_direct_skills: "Directly Applicable Skills",
    q5_improve_skills: "Improvement Areas",
    q6_connect: "Networking Strategy",
  };
  const orderedKeys: QuestionKey[] = [
    // UPDATED KEYS
    "q1_attracts",
    "q2_concerns",
    "q3_questions",
    "q4_direct_skills",
    "q5_improve_skills",
    "q6_connect",
  ];

  const keysToRender = showAll || !questionKey ? orderedKeys : [questionKey];

// ... rest of the component remains the same
7. src/components/interview/StepRenderer.tsx
This file requires the most changes to remove the entire voice interaction/timer logic and replace it with a text-based form input/submission system.

TypeScript
// File: src/components/interview/StepRenderer.tsx

"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
// Remove: import { useConversation } from "@elevenlabs/react"; // REMOVED
import { SendIcon } from "lucide-react"; // NEW IMPORT

import { Transcript } from "@/components/interview/Transcript";
import { ScoreCard } from "@/components/interview/ScoreCard";
import { VideoFrame } from "@/components/ui/video-frame";
import { Button } from "@/components/ui/button";
// Remove: import { Orb } from "@/components/ui/orb"; // REMOVED
// Remove: import { MicSelector } from "@/components/ui/mic-selector"; // REMOVED
import { Textarea } from "@/components/ui/textarea"; // NEW IMPORT
// Remove: import { DEFAULT_HARD_STOP_MS, DEFAULT_SOFT_WARNING_MS, DEFAULT_WRAP_LINE, formatMsAsClock } from "@/lib/time-limit"; // REMOVED UNUSED
import type { FlowStep } from "@/types/flow";
import type { GeminiAnalysis, QuestionKey, TranscriptMessage } from "@/types/interview";

// UPDATED TO REFLECT NEW KEYS
const orderedQuestionKeys: QuestionKey[] = [
  "q1_attracts",
  "q2_concerns",
  "q3_questions",
  "q4_direct_skills",
  "q5_improve_skills",
  "q6_connect",
];

const questionLabels: Record<QuestionKey, string> = {
  // UPDATED LABELS
  q1_attracts: "Attraction to pathway",
  q2_concerns: "Concerns/Risks",
  q3_questions: "Questions/Curiosities",
  q4_direct_skills: "Directly Applicable Skills",
  q5_improve_skills: "Improvement Areas",
  q6_connect: "Networking Strategy",
};

function questionKeyFromStepId(stepId: string): QuestionKey | undefined {
  const match = stepId.match(/^q(\d)-/);
  if (!match) return undefined;
  const num = match[1];
  // UPDATED TO HANDLE 6 QUESTIONS
  if (num === "1") return "q1_attracts";
  if (num === "2") return "q2_concerns";
  if (num === "3") return "q3_questions";
  if (num === "4") return "q4_direct_skills";
  if (num === "5") return "q5_improve_skills";
  if (num === "6") return "q6_connect";
  return undefined;
}

type StepRendererProps = {
  step: FlowStep;
  messages: TranscriptMessage[];
  score: GeminiAnalysis | null;
  loadingScore: boolean;
  status: string | null;
  onMessage: (message: { source: "user" | "ai"; message: string }) => void;
  onScore: () => void;
  onClear: () => void;
  onAdvance: () => void;
  provider: "openai" | "anthropic";
};

// Simplified Agent interaction functions for a text-only simulation.
// This simulates the LLM agent responding by simply recording the user's input
// and immediately outputting a short generic AI response to continue the 'conversation' flow,
// as a text-based "conversation" requires some AI input to mimic interactivity.

/**
 * Sends the user message and generates a simple canned AI response for a text-based mock.
 * In a full app, this would call an API route to generate a proper follow-up/acknowledge.
 */
function simulateAgentResponse(userMessage: string, onMessage: StepRendererProps["onMessage"]) {
  if (userMessage.length < 10) {
    onMessage({ source: "ai", message: "That's a good start. Could you elaborate on that point?" });
  } else if (userMessage.length < 50) {
    onMessage({ source: "ai", message: "Thank you. Is there anything else you would like to add about that?" });
  } else {
    onMessage({ source: "ai", message: "Understood. That covers the core question well. We can move on to the next one, or you can send a follow-up answer." });
  }
}


export function StepRenderer({
  step,
  messages,
  score,
  loadingScore,
  status,
  onMessage,
  onScore,
  onClear,
  onAdvance,
  provider,
}: StepRendererProps) {
  void provider;
  const questionKey = questionKeyFromStepId(step.id);
  const showAllScores = step.id === "final-review";
  
  // NEW STATE: Text input
  const [textInput, setTextInput] = useState("");

  // Replicate conversation/session state for UI enablement, simplified for text
  const [callState, setCallState] = useState<"disconnected" | "connected">("disconnected");
  const isConnected = callState === "connected";

  // Simulate starting/ending the text-based interview session
  const startConversation = useCallback(() => {
    setCallState("connected");
    onMessage({ source: "ai", message: `Welcome! Let's discuss: ${step.questionText}` });
  }, [onMessage, step.questionText]);

  const endConversation = useCallback(() => {
    setCallState("disconnected");
  }, []);

  const handleSendText = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedInput = textInput.trim();
      if (!trimmedInput) return;

      // 1. Record user message
      onMessage({ source: "user", message: trimmedInput });
      setTextInput("");
      
      // 2. Simulate AI response/acknowledgement
      simulateAgentResponse(trimmedInput, onMessage);
    },
    [textInput, onMessage]
  );
  
  // Handlers for the main button
  const handleStartOrEnd = useCallback(() => {
      if (isConnected) {
        endConversation();
      } else {
        startConversation();
      }
    }, [isConnected, endConversation, startConversation]);

  // Use the local state logic for resetting the text conversation flow
  const resetConversation = useCallback(() => {
    endConversation();
    onClear();
  }, [endConversation, onClear]);


  // --- REMOVE: All old voice/timer logic ---
  // Removed logic including: clearTimers, warningTimeoutRef, hardStopTimeoutRef, etc.
  // Removed useConversation hook, as the simulated API interaction replaces it.
  // The 'downloadCsv' function is fine and remains the same.
  const downloadCsv = useCallback(() => {
    if (!score) return;
    // ... CSV generation logic (unchanged)
    const headers = [
      "Question",
      "Content",
      "Communication clarity",
      "Conciseness & efficiency",
      "Specificity",
      "Strengths",
      "Weaknesses",
    ];

    const toCsvValue = (value: string | number) => {
      const str = typeof value === "string" ? value : String(value);
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rows = orderedQuestionKeys.map((key) => {
      const data = score.questions[key];
      return [
        questionLabels[key],
        data?.score_content ?? "",
        data?.score_communication_clarity ?? "",
        data?.score_conciseness_efficiency ?? "",
        data?.score_specificity ?? "",
        (data?.strengths ?? []).join("; "),
        (data?.weaknesses ?? []).join("; "),
      ];
    });

    const csv = [headers, ...rows]
      .map((row) => row.map(toCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "interview-report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [score]);


  if (step.type === "intro") {
    return (
      <VideoFrame
        title="Why This Matters"
        description="Practice common interview questions in a realistic text simulation and receive detailed, personalized feedback on your written responses. The scoring mechanism evaluates your answers and provides specific guidance to strengthen your communication, technical knowledge, and overall approach."
      />
    );
  }

  if (step.type === "question") {
    return (
      <div className="space-y-8 text-center">
        <p className="text-sm text-muted-foreground uppercase tracking-wider">Question Prep</p>
        <h2 className="text-2xl font-semibold text-[#0f1729]">{step.questionText}</h2>
        <div className="flex justify-center">
          <Button
            className="rounded-full bg-[#05b6ff] px-6 py-3 text-white hover:bg-[#0aa3e2]"
            onClick={onAdvance}
          >
            Ready To Answer
          </Button>
        </div>
      </div>
    );
  }

  if (step.type === "agent") {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-1 text-xs font-semibold text-slate-700">
            {/* Removed all time/timer logic/badges */}
            <span className="rounded-full border px-3 py-1 border-slate-200 bg-white text-slate-700">Text-Only Interview Mode</span>
          </div>
          
          {/* Replaced Orb/MicSelector with a simplified button for session state */}
          <div className="relative h-48 w-full rounded-xl border bg-white shadow-sm flex items-center justify-center">
              <Button
                variant="default"
                className="rounded-full bg-[#05b6ff] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#0aa3e2]"
                onClick={handleStartOrEnd}
              >
                {isConnected ? "End Interview" : "Begin Interview"}
              </Button>
          </div>
          
          <button
            type="button"
            onClick={resetConversation}
            className="text-xs font-semibold text-slate-600 underline-offset-2 hover:underline disabled:opacity-60"
            disabled={!isConnected && messages.length > 0}
          >
            Reset conversation
          </button>
          <p className="text-xs text-muted-foreground text-center md:text-left">
            Write your answer, send it, and wait for a brief simulated follow-up from the AI. Click &quot;End Interview&quot; when you are satisfied with your answer, then click &quot;Score transcript&quot; to get detailed feedback.
          </p>
        </div>
        
        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Transcript messages={messages} />
          <div className="flex flex-col gap-4">
              <div className="relative">
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      handleSendText(e);
                    }
                  }}
                  placeholder={isConnected ? "Enter your answer here..." : "Click 'Begin Interview' to start..."}
                  className="min-h-[100px] resize-none pr-12"
                  disabled={!isConnected}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSendText}
                  disabled={!textInput.trim() || !isConnected}
                  className="absolute right-3 bottom-3 h-8 w-8"
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
              </div>
            <ScoreCard score={score} loading={loadingScore} questionKey={questionKey} showAll={showAllScores} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {status ?? "When you finish the interview, score the transcript."}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="rounded-md border px-3 py-2 text-sm"
              disabled={loadingScore}
            >
              Clear transcript
            </button>
            <button
              onClick={onScore}
              className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
              disabled={loadingScore || messages.length === 0}
            >
              {loadingScore ? "Scoring..." : "Score transcript"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step.type === "review") {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">{step.title}</h2>
            <p className="text-sm text-muted-foreground">Review the scoring results below.</p>
          </div>
          {step.id === "final-review" ? (
            <Button
              variant="outline"
              onClick={downloadCsv}
              disabled={!score || loadingScore}
            >
              Download CSV report
            </Button>
          ) : null}
        </div>
        <div className="space-y-4">
          <ScoreCard score={score} loading={loadingScore} questionKey={questionKey} showAll={showAllScores} />
          {step.id === "final-review" ? (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              <h3 className="text-base font-semibold text-foreground">Understanding Your Scores</h3>
              <div className="mt-2 space-y-2">
                <div>
                  <p className="font-medium text-foreground">General Scoring Guidance:</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li>Score below 6: Would likely not advance to the next round in most interview processes.</li>
                    <li>Score 6–8: Falls within the range where advancement is possible depending on other factors.</li>
                    <li>Score 8+: Would likely advance you forward in most interview processes.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground">Important Context:</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li>Role level: Analyst expectations differ from Associate or VP-level roles.</li>
                    <li>Market competitiveness: Top-tier institutional firms set a higher bar than regional owner-operators.</li>
                    <li>Firm priorities: Different teams weight technical skills, cultural fit, and competencies differently.</li>
                    <li>Interview stage: Screening calls differ from final-round conversations with senior leadership.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground">Remember:</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li>Interview performance is cumulative; one weaker answer can be offset elsewhere.</li>
                    <li>Cultural fit and personality alignment matter beyond what scores capture.</li>
                    <li>Use these scores as diagnostics to target improvements before real interviews.</li>
                    <li>Practice and iteration build momentum—multiple mock sessions surface performance patterns.</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return null;
}
