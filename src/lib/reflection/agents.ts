import "server-only";

import type { ReflectionModule } from "@/lib/reflection/modules";

function envName(base: string, index: number) {
  return index === 1 ? `${base}_ID` : `${base}_${index}_ID`;
}

export function resolveAgentIds(moduleConfig: Pick<ReflectionModule, "agentEnvBase" | "legacyAgentEnvBase" | "fallbackAgentIds">) {
  const ids: string[] = [];
  for (let i = 1; i <= 6; i += 1) {
    const primary = process.env[envName(moduleConfig.agentEnvBase, i)];
    const legacy = moduleConfig.legacyAgentEnvBase ? process.env[envName(moduleConfig.legacyAgentEnvBase, i)] : undefined;
    const fallback = moduleConfig.fallbackAgentIds[i - 1];
    ids.push((primary ?? legacy ?? fallback).trim());
  }
  return ids as [string, string, string, string, string, string];
}
