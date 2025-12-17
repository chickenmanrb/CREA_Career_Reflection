import { notFound } from "next/navigation";

import { ReflectionInterviewClient } from "@/components/reflection/ReflectionInterviewClient";
import { resolveAgentIds } from "@/lib/reflection/agents";
import { buildReflectionFlowConfig } from "@/lib/reflection/flow-config";
import { getReflectionModuleBySlug } from "@/lib/reflection/modules";

export default async function ReflectionInterviewPage({ params }: { params: Promise<{ module: string }> }) {
  const resolvedParams = await params;
  const moduleConfig = getReflectionModuleBySlug(resolvedParams.module);
  if (!moduleConfig) notFound();
  const agentIds = resolveAgentIds(moduleConfig);
  const flowConfig = buildReflectionFlowConfig(agentIds);
  return <ReflectionInterviewClient module={moduleConfig} flowConfig={flowConfig} />;
}
