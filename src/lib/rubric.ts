import { z } from "zod";

import type { GeminiAnalysis, TranscriptMessage } from "@/types/interview";

export const transcriptMessageSchema = z.object({
  id: z.string().min(1),
  source: z.enum(["user", "ai"]),
  message: z.string().min(1),
  timestamp: z.string().optional(),
  stepId: z.string().optional(),
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
    q1_attracts: QuestionScoreSchema,
    q2_concerns: QuestionScoreSchema,
    q3_questions: QuestionScoreSchema,
    q4_direct_skills: QuestionScoreSchema,
    q5_improve_skills: QuestionScoreSchema,
    q6_connect: QuestionScoreSchema,
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
You are a career reflection coach scoring written answers. Score *one question at a time* when a questionKey is provided. Only score the supplied question; leave all other questions at 0 with empty strengths/weaknesses.

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

export function joinTranscript(transcript: TranscriptMessage[]): string {
  return transcript
    .map((msg) => {
      const speaker = msg.source === "ai" ? "Interviewer" : "Candidate";
      return `${speaker}: ${msg.message}`;
    })
    .join("\n");
}

export function safeParseAnalysis(text: string): GeminiAnalysis {
  const cleaned = text.trim().startsWith("```") ? text.replace(/```json?|```/g, "").trim() : text.trim();
  const emptyScores = {
    q1_attracts: {
      score_content: 0,
      score_communication_clarity: 0,
      score_conciseness_efficiency: 0,
      score_specificity: 0,
      strengths: [] as string[],
      weaknesses: [] as string[],
    },
    q2_concerns: {
      score_content: 0,
      score_communication_clarity: 0,
      score_conciseness_efficiency: 0,
      score_specificity: 0,
      strengths: [] as string[],
      weaknesses: [] as string[],
    },
    q3_questions: {
      score_content: 0,
      score_communication_clarity: 0,
      score_conciseness_efficiency: 0,
      score_specificity: 0,
      strengths: [] as string[],
      weaknesses: [] as string[],
    },
    q4_direct_skills: {
      score_content: 0,
      score_communication_clarity: 0,
      score_conciseness_efficiency: 0,
      score_specificity: 0,
      strengths: [] as string[],
      weaknesses: [] as string[],
    },
    q5_improve_skills: {
      score_content: 0,
      score_communication_clarity: 0,
      score_conciseness_efficiency: 0,
      score_specificity: 0,
      strengths: [] as string[],
      weaknesses: [] as string[],
    },
    q6_connect: {
      score_content: 0,
      score_communication_clarity: 0,
      score_conciseness_efficiency: 0,
      score_specificity: 0,
      strengths: [] as string[],
      weaknesses: [] as string[],
    },
  } as const;

  try {
    const parsed = JSON.parse(cleaned);
    const validated = analysisSchema.parse(parsed);
    return validated;
  } catch {
    return {
      questions: emptyScores,
      rawText: cleaned.slice(0, 1000),
    };
  }
}

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
