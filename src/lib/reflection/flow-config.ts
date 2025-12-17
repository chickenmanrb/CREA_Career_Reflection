import type { MultiAgentConfig } from "@/types/flow";
import { DEFAULT_HARD_STOP_MS, DEFAULT_SOFT_WARNING_MS, DEFAULT_WRAP_LINE } from "@/lib/time-limit";

export function buildReflectionFlowConfig(agentIds: readonly [string, string, string, string, string, string]): MultiAgentConfig {
  return {
    steps: [
      {
        id: "intro",
        type: "intro",
        title: "Introduction and Instruction",
        subtitle: "Meet Your AI Interview Coach",
        description:
          "Reflect on six career pathway prompts in a text-first experience. You'll write answers, get light AI follow-ups, and receive targeted feedback on clarity, specificity, and alignment with your goals.",
        videoUrl: "",
      },
      {
        id: "q1-agent",
        type: "agent",
        title: "Live Answer",
        agentId: agentIds[0],
        description: "Live answer with Agent 1",
        questionText: "What attracts you to this pathway?",
        softWarningMs: DEFAULT_SOFT_WARNING_MS,
        hardStopMs: DEFAULT_HARD_STOP_MS,
        wrapUpLine: DEFAULT_WRAP_LINE,
      },
      {
        id: "q2-agent",
        type: "agent",
        title: "Talk to your AI Career Coach",
        agentId: agentIds[1],
        description: "Live answer with Agent 2",
        questionText: "What concerns you about this pathway?",
        softWarningMs: DEFAULT_SOFT_WARNING_MS,
        hardStopMs: DEFAULT_HARD_STOP_MS,
        wrapUpLine: DEFAULT_WRAP_LINE,
      },
      {
        id: "q3-agent",
        type: "agent",
        title: "Talk to your AI Career Coach",
        agentId: agentIds[2],
        description: "Live answer with Agent 3",
        questionText: "What questions and curiosities do you have?",
        softWarningMs: DEFAULT_SOFT_WARNING_MS,
        hardStopMs: DEFAULT_HARD_STOP_MS,
        wrapUpLine: DEFAULT_WRAP_LINE,
      },
      {
        id: "q4-agent",
        type: "agent",
        title: "Talk to your AI Career Coach",
        agentId: agentIds[3],
        description: "Live answer with Agent 4",
        questionText: "What skills or traits do you have that directly apply?",
        softWarningMs: DEFAULT_SOFT_WARNING_MS,
        hardStopMs: DEFAULT_HARD_STOP_MS,
        wrapUpLine: DEFAULT_WRAP_LINE,
      },
      {
        id: "q5-agent",
        type: "agent",
        title: "Talk to your AI Career Coach",
        agentId: agentIds[4],
        description: "Live answer with Agent 5",
        questionText: "What skills or traits do you need to improve on?",
        softWarningMs: DEFAULT_SOFT_WARNING_MS,
        hardStopMs: DEFAULT_HARD_STOP_MS,
        wrapUpLine: DEFAULT_WRAP_LINE,
      },
      {
        id: "q6-agent",
        type: "agent",
        title: "Talk to your AI Career Coach",
        agentId: agentIds[5],
        description: "Live answer with Agent 6",
        questionText: "Who can you connect with to learn about this path?",
        softWarningMs: DEFAULT_SOFT_WARNING_MS,
        hardStopMs: DEFAULT_HARD_STOP_MS,
        wrapUpLine: DEFAULT_WRAP_LINE,
      },
      {
        id: "finish",
        type: "finish",
        title: "Finish",
        description: "Wrap up and download your transcript.",
      },
    ],
  };
}

