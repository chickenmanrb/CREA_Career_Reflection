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
  | "q6_connect";
