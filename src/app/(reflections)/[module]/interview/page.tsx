import { notFound } from "next/navigation";

import { ReflectionInterviewClient } from "@/components/reflection/ReflectionInterviewClient";
import { getReflectionModuleBySlug } from "@/lib/reflection/modules";

export default function ReflectionInterviewPage({ params }: { params: { module: string } }) {
  const moduleConfig = getReflectionModuleBySlug(params.module);
  if (!moduleConfig) notFound();
  return <ReflectionInterviewClient module={moduleConfig} />;
}

