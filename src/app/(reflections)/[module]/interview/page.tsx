import { notFound } from "next/navigation";

import { ReflectionInterviewClient } from "@/components/reflection/ReflectionInterviewClient";
import { getReflectionModuleBySlug } from "@/lib/reflection/modules";

export default async function ReflectionInterviewPage({ params }: { params: Promise<{ module: string }> }) {
  const resolvedParams = await params;
  const moduleConfig = getReflectionModuleBySlug(resolvedParams.module);
  if (!moduleConfig) notFound();
  return <ReflectionInterviewClient module={moduleConfig} />;
}
