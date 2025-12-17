import { notFound } from "next/navigation";

import { ReflectionEntryClient } from "@/components/reflection/ReflectionEntryClient";
import { getReflectionModuleBySlug } from "@/lib/reflection/modules";

export default async function ReflectionEntryPage({ params }: { params: Promise<{ module: string }> }) {
  const resolvedParams = await params;
  const moduleConfig = getReflectionModuleBySlug(resolvedParams.module);
  if (!moduleConfig) notFound();
  return <ReflectionEntryClient module={moduleConfig} />;
}
