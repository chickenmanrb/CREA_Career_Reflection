import { notFound } from "next/navigation";

import { ReflectionEntryClient } from "@/components/reflection/ReflectionEntryClient";
import { getReflectionModuleBySlug } from "@/lib/reflection/modules";

export default function ReflectionEntryPage({ params }: { params: { module: string } }) {
  const moduleConfig = getReflectionModuleBySlug(params.module);
  if (!moduleConfig) notFound();
  return <ReflectionEntryClient module={moduleConfig} />;
}

