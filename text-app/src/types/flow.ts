export type FlowStepType = "intro" | "question" | "agent" | "review";

export interface FlowStep {
  id: string;
  type: FlowStepType;
  title: string;
  subtitle?: string;
  description?: string;
  videoUrl?: string;
  agentId?: string;
  questionText?: string;
  nextId?: string;
  softWarningMs?: number;
  hardStopMs?: number;
  wrapUpLine?: string;
}

export interface MultiAgentConfig {
  steps: FlowStep[];
}
