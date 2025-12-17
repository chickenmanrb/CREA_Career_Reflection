import "server-only";

import type { ReflectionModule } from "@/lib/reflection/modules";

function envName(base: string, index: number) {
  return index === 1 ? `${base}_ID` : `${base}_${index}_ID`;
}

let parsedJsonCache: Record<string, unknown> | null | undefined;

function getAgentIdsJson(): Record<string, unknown> | null {
  if (parsedJsonCache !== undefined) return parsedJsonCache ?? null;
  const raw = process.env.REFLECTION_AGENT_IDS_JSON;
  if (!raw || !raw.trim()) {
    parsedJsonCache = null;
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      parsedJsonCache = null;
      return null;
    }
    parsedJsonCache = parsed as Record<string, unknown>;
    return parsedJsonCache;
  } catch {
    parsedJsonCache = null;
    return null;
  }
}

function asSixAgentIds(value: unknown): [string, string, string, string, string, string] | null {
  if (!Array.isArray(value) || value.length !== 6) return null;
  const normalized = value.map((v) => (typeof v === "string" ? v.trim() : ""));
  if (normalized.some((v) => !v)) return null;
  return normalized as [string, string, string, string, string, string];
}

export function resolveAgentIds(
  moduleConfig: Pick<ReflectionModule, "id" | "agentEnvBase" | "legacyAgentEnvBase" | "fallbackAgentIds">
) {
  const json = getAgentIdsJson();
  if (json) {
    const override = asSixAgentIds(json[moduleConfig.id]);
    if (override) return override;
  }

  const ids: string[] = [];
  for (let i = 1; i <= 6; i += 1) {
    const primary = process.env[envName(moduleConfig.agentEnvBase, i)];
    const legacy = moduleConfig.legacyAgentEnvBase ? process.env[envName(moduleConfig.legacyAgentEnvBase, i)] : undefined;
    const fallback = moduleConfig.fallbackAgentIds[i - 1];
    ids.push((primary ?? legacy ?? fallback).trim());
  }
  return ids as [string, string, string, string, string, string];
}
