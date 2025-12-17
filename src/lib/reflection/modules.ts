export type ReflectionModuleId = "acquisitions" | "asset-management" | "development" | "brokerage";

export type ReflectionModule = {
  id: ReflectionModuleId;
  slug: string;
  exercise: string;
  storagePrefix: string;
  title: string;
  transcriptTitle: string;
  transcriptFilenamePrefix: string;
  signedUrlEndpoint: string;
  sessionEndpoint: string;
  agentEnvBase: string;
  legacyAgentEnvBase?: string;
  fallbackAgentIds: readonly [string, string, string, string, string, string];
};

export const REFLECTION_MODULES: Record<ReflectionModuleId, ReflectionModule> = {
  acquisitions: {
    id: "acquisitions",
    slug: "acquisitions",
    exercise: "acquisitions",
    storagePrefix: "acquisitions",
    title: "Acquisitions Career Pathway Reflection",
    transcriptTitle: "Acquisitions Career Pathway Reflection Transcript",
    transcriptFilenamePrefix: "acquisitions-reflection-transcript",
    signedUrlEndpoint: "/api/acquisitions/coach/signed-url",
    sessionEndpoint: "/api/acquisitions/session",
    agentEnvBase: "NEXT_PUBLIC_ACQUISITION_AGENT",
    legacyAgentEnvBase: "NEXT_PUBLIC_ELEVENLABS_AGENT",
    fallbackAgentIds: [
      "agent_9301kb17m8qafjz81fzh3xed32gw",
      "agent_3001kb17yts2ez6tmp7h6yczfeej",
      "agent_4101kb18epgrfpd8fthhywkwc5vh",
      "agent_2101kb18g7gtesyv4319ybbppf6y",
      "agent_4301kb18hc1mfvz9qwrw5k5acnry",
      "agent_7001kb18jpckevg876ah1m4472hc",
    ],
  },
  "asset-management": {
    id: "asset-management",
    slug: "asset-management",
    exercise: "asset_management",
    storagePrefix: "asset_management",
    title: "Asset Management Career Pathway Reflection",
    transcriptTitle: "Asset Management Career Pathway Reflection Transcript",
    transcriptFilenamePrefix: "asset-management-reflection-transcript",
    signedUrlEndpoint: "/api/asset-management/coach/signed-url",
    sessionEndpoint: "/api/asset-management/session",
    agentEnvBase: "NEXT_PUBLIC_ASSET_MANAGEMENT_AGENT",
    legacyAgentEnvBase: "NEXT_PUBLIC_ELEVENLABS_ASSET_MANAGEMENT_AGENT",
    fallbackAgentIds: [
      "agent_9301kb17m8qafjz81fzh3xed32gw",
      "agent_3001kb17yts2ez6tmp7h6yczfeej",
      "agent_4101kb18epgrfpd8fthhywkwc5vh",
      "agent_2101kb18g7gtesyv4319ybbppf6y",
      "agent_4301kb18hc1mfvz9qwrw5k5acnry",
      "agent_7001kb18jpckevg876ah1m4472hc",
    ],
  },
  development: {
    id: "development",
    slug: "development",
    exercise: "development",
    storagePrefix: "development",
    title: "Development Career Pathway Reflection",
    transcriptTitle: "Development Career Pathway Reflection Transcript",
    transcriptFilenamePrefix: "development-reflection-transcript",
    signedUrlEndpoint: "/api/development/coach/signed-url",
    sessionEndpoint: "/api/development/session",
    agentEnvBase: "NEXT_PUBLIC_DEVELOPMENT_AGENT",
    fallbackAgentIds: [
      "agent_9301kb17m8qafjz81fzh3xed32gw",
      "agent_3001kb17yts2ez6tmp7h6yczfeej",
      "agent_4101kb18epgrfpd8fthhywkwc5vh",
      "agent_2101kb18g7gtesyv4319ybbppf6y",
      "agent_4301kb18hc1mfvz9qwrw5k5acnry",
      "agent_7001kb18jpckevg876ah1m4472hc",
    ],
  },
  brokerage: {
    id: "brokerage",
    slug: "brokerage",
    exercise: "brokerage",
    storagePrefix: "brokerage",
    title: "Brokerage Career Pathway Reflection",
    transcriptTitle: "Brokerage Career Pathway Reflection Transcript",
    transcriptFilenamePrefix: "brokerage-reflection-transcript",
    signedUrlEndpoint: "/api/brokerage/coach/signed-url",
    sessionEndpoint: "/api/brokerage/session",
    agentEnvBase: "NEXT_PUBLIC_BROKERAGE_AGENT",
    fallbackAgentIds: [
      "agent_9301kb17m8qafjz81fzh3xed32gw",
      "agent_3001kb17yts2ez6tmp7h6yczfeej",
      "agent_4101kb18epgrfpd8fthhywkwc5vh",
      "agent_2101kb18g7gtesyv4319ybbppf6y",
      "agent_4301kb18hc1mfvz9qwrw5k5acnry",
      "agent_7001kb18jpckevg876ah1m4472hc",
    ],
  },
};

export function getReflectionModule(id: ReflectionModuleId): ReflectionModule {
  return REFLECTION_MODULES[id];
}

export function listReflectionModules(): ReflectionModule[] {
  return Object.values(REFLECTION_MODULES);
}

export function getReflectionModuleBySlug(slug: string): ReflectionModule | null {
  const match = listReflectionModules().find((m) => m.slug === slug);
  return match ?? null;
}
