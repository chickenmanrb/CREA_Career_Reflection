import type { MultiAgentConfig } from "@/types/flow";
import { DEFAULT_HARD_STOP_MS, DEFAULT_SOFT_WARNING_MS, DEFAULT_WRAP_LINE } from "@/lib/time-limit";

const AGENT_1 =
  process.env.NEXT_PUBLIC_ASSET_MANAGEMENT_AGENT_ID ??
  process.env.NEXT_PUBLIC_ELEVENLABS_ASSET_MANAGEMENT_AGENT_ID ??
  "agent_9301kb17m8qafjz81fzh3xed32gw";
const AGENT_2 =
  process.env.NEXT_PUBLIC_ASSET_MANAGEMENT_AGENT_2_ID ??
  process.env.NEXT_PUBLIC_ELEVENLABS_ASSET_MANAGEMENT_AGENT_2_ID ??
  "agent_3001kb17yts2ez6tmp7h6yczfeej";
const AGENT_3 =
  process.env.NEXT_PUBLIC_ASSET_MANAGEMENT_AGENT_3_ID ??
  process.env.NEXT_PUBLIC_ELEVENLABS_ASSET_MANAGEMENT_AGENT_3_ID ??
  "agent_4101kb18epgrfpd8fthhywkwc5vh";
const AGENT_4 =
  process.env.NEXT_PUBLIC_ASSET_MANAGEMENT_AGENT_4_ID ??
  process.env.NEXT_PUBLIC_ELEVENLABS_ASSET_MANAGEMENT_AGENT_4_ID ??
  "agent_2101kb18g7gtesyv4319ybbppf6y";
const AGENT_5 =
  process.env.NEXT_PUBLIC_ASSET_MANAGEMENT_AGENT_5_ID ??
  process.env.NEXT_PUBLIC_ELEVENLABS_ASSET_MANAGEMENT_AGENT_5_ID ??
  "agent_4301kb18hc1mfvz9qwrw5k5acnry";
const AGENT_6 =
  process.env.NEXT_PUBLIC_ASSET_MANAGEMENT_AGENT_6_ID ??
  process.env.NEXT_PUBLIC_ELEVENLABS_ASSET_MANAGEMENT_AGENT_6_ID ??
  "agent_7001kb18jpckevg876ah1m4472hc";

export const assetManagementFlowConfig: MultiAgentConfig = {
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
      agentId: AGENT_1,
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
      agentId: AGENT_2,
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
      agentId: AGENT_3,
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
      agentId: AGENT_4,
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
      agentId: AGENT_5,
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
      agentId: AGENT_6,
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
