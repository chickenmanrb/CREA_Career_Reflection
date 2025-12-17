import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getReflectionModuleBySlug, listReflectionModules } from "@/lib/reflection/modules";

export function generateStaticParams() {
  return listReflectionModules().map((m) => ({ module: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const moduleConfig = getReflectionModuleBySlug(resolvedParams.module);
  if (!moduleConfig) return {};
  return {
    title: moduleConfig.title,
    description: `Write, refine, and download your ${moduleConfig.title} transcript.`,
  };
}

export default async function ReflectionModuleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ module: string }>;
}>) {
  const resolvedParams = await params;
  const moduleConfig = getReflectionModuleBySlug(resolvedParams.module);
  if (!moduleConfig) notFound();
  return children;
}
