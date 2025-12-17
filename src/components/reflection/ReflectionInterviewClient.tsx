"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";

import { StepRenderer } from "@/components/interview/StepRenderer";
import { LeftNav } from "@/components/layout/LeftNav";
import { Card, CardContent } from "@/components/ui/card";
import type { ReflectionModule } from "@/lib/reflection/modules";
import { resolveAgentIds } from "@/lib/reflection/agents";
import { buildReflectionFlowConfig } from "@/lib/reflection/flow-config";
import { questionKeyFromStepId } from "@/lib/reflection/question-key";
import type { QuestionKey, TranscriptMessage } from "@/types/interview";

const CRE_ANALYST_HOST = "creanalyst.com";

type PersistState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "saved"; id: string }
  | { status: "error"; error: string };

function storageKeys(storagePrefix: string) {
  return {
    name: `crea_${storagePrefix}_candidate_name`,
    email: `crea_${storagePrefix}_candidate_email`,
  } as const;
}

export function ReflectionInterviewClient({ module }: { module: ReflectionModule }) {
  const agentIds = useMemo(() => resolveAgentIds(module), [module]);
  const flowConfig = useMemo(() => buildReflectionFlowConfig(agentIds), [agentIds]);

  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [currentStepId, setCurrentStepId] = useState<string>(flowConfig.steps[0]?.id ?? "");
  const [persistState, setPersistState] = useState<PersistState>({ status: "idle" });

  const agentConfigured = flowConfig.steps.some((s) => s.type === "agent" && s.agentId && s.agentId.length > 0);

  const handleMessage = useCallback(
    (payload: {
      source: "user" | "ai";
      message: string;
      stepId: string;
      questionKey?: QuestionKey;
    }) => {
      const resolvedStepId = payload.stepId || currentStepId;
      const resolvedQuestionKey = payload.questionKey ?? questionKeyFromStepId(resolvedStepId);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          source: payload.source,
          message: payload.message,
          timestamp: new Date().toLocaleTimeString(),
          stepId: resolvedStepId,
          questionKey: resolvedQuestionKey,
        },
      ]);
    },
    [currentStepId]
  );

  const currentStep = useMemo(
    () => flowConfig.steps.find((s) => s.id === currentStepId) ?? flowConfig.steps[0],
    [currentStepId, flowConfig.steps]
  );

  const messagesForCurrentStep = useMemo(
    () => messages.filter((msg) => msg.stepId === currentStepId),
    [messages, currentStepId]
  );

  const clearCurrentStep = useCallback(() => {
    setMessages((prev) => prev.filter((msg) => msg.stepId !== currentStepId));
  }, [currentStepId]);

  const downloadTranscript = useCallback(() => {
    if (messages.length === 0) return;

    const lines: string[] = [];
    let lastStepId: string | undefined;
    messages.forEach((msg) => {
      if (msg.stepId && msg.stepId !== lastStepId) {
        const stepMeta = flowConfig.steps.find((s) => s.id === msg.stepId);
        if (stepMeta) {
          lines.push(`--- ${stepMeta.questionText ?? stepMeta.title} ---`);
        }
        lastStepId = msg.stepId;
      }

      const speaker = msg.source === "user" ? "You" : "Coach";
      lines.push(`${speaker}: ${msg.message}`);
    });

    const payload = [module.transcriptTitle, `Generated: ${new Date().toLocaleString()}`, "", ...lines].join("\n");

    const blob = new Blob([payload], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${module.transcriptFilenamePrefix}-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [flowConfig.steps, messages, module.transcriptFilenamePrefix, module.transcriptTitle]);

  const promptSteps = useMemo(() => flowConfig.steps.filter((s) => s.type === "agent"), [flowConfig.steps]);
  const currentPromptNumber = useMemo(() => {
    const match = currentStepId.match(/^q(\d)-/);
    return match ? Number(match[1]) : null;
  }, [currentStepId]);
  const totalPrompts = promptSteps.length;

  const stepsForNav = useMemo(() => flowConfig.steps, [flowConfig.steps]);
  const currentIdx = Math.max(0, stepsForNav.findIndex((s) => s.id === currentStepId));
  const goPrev = () => {
    if (currentIdx > 0) setCurrentStepId(stepsForNav[currentIdx - 1].id);
  };

  const goNext = () => {
    if (currentIdx < stepsForNav.length - 1) setCurrentStepId(stepsForNav[currentIdx + 1].id);
  };

  const persistTranscript = useCallback(async () => {
    if (persistState.status === "saving") return;
    if (messages.length === 0) return;

    const keys = storageKeys(module.storagePrefix);
    const candidateName = typeof window === "undefined" ? undefined : (localStorage.getItem(keys.name) ?? undefined);
    const candidateEmail = typeof window === "undefined" ? undefined : (localStorage.getItem(keys.email) ?? undefined);

    setPersistState({ status: "saving" });
    try {
      const response = await fetch(module.sessionEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ candidateName, candidateEmail, transcript: messages }),
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; id?: string; error?: string } | null;
      if (!response.ok || !data?.ok || !data.id) {
        throw new Error(data?.error ?? `Failed to save transcript (${response.status})`);
      }
      setPersistState({ status: "saved", id: data.id });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save transcript.";
      setPersistState({ status: "error", error: message });
    }
  }, [messages, module.sessionEndpoint, module.storagePrefix, persistState.status]);

  useEffect(() => {
    if (currentStep?.type !== "finish") return;
    if (persistState.status !== "idle") return;
    if (messages.length === 0) return;
    void persistTranscript();
  }, [currentStep?.type, messages.length, persistState.status, persistTranscript]);

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <header className="flex items-center justify-between bg-[#0f1729] px-5 py-3 text-white shadow">
        <div className="flex items-center gap-3">
          <Image src="/assets/CRE logo.webp" alt="CRE Analyst" width={120} height={32} className="h-8 w-auto" />
          <div className="text-sm font-semibold tracking-wide">{module.title}</div>
        </div>
        <div className="text-xs font-semibold text-white/80">{CRE_ANALYST_HOST}</div>
      </header>

      <div className="flex min-h-[calc(100vh-56px)]">
        <LeftNav steps={stepsForNav} currentId={currentStep.id} onSelect={setCurrentStepId} title={module.title} />
        <main className="flex flex-1 flex-col overflow-y-auto px-6 py-8 md:px-8 md:py-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold">{module.title}</h1>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  className="rounded-full border px-3 py-2 text-xs font-semibold hover:bg-muted disabled:opacity-40"
                  disabled={currentIdx === 0}
                >
                  Previous
                </button>
                <span className="text-foreground font-semibold">
                  {currentPromptNumber
                    ? `Prompt ${currentPromptNumber} of ${totalPrompts}: ${currentStep.questionText ?? currentStep.title}`
                    : currentStep.title}
                </span>
                <button
                  onClick={goNext}
                  className="rounded-full border px-3 py-2 text-xs font-semibold hover:bg-muted disabled:opacity-40"
                  disabled={currentIdx === stepsForNav.length - 1}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {!agentConfigured && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-dashed bg-amber-50 p-4 text-amber-900">
              <AlertCircle className="h-5 w-5" />
              <div className="text-sm">Agent IDs are optional in text-only mode. You can still practice the prompts using the text coach.</div>
            </div>
          )}

          <Card className="border border-primary/10 bg-gradient-to-br from-primary/5 to-background flex flex-1 flex-col">
            <CardContent className="space-y-6 flex flex-1 flex-col">
              <StepRenderer
                key={currentStepId}
                step={currentStep}
                messages={messagesForCurrentStep}
                allMessages={messages}
                onMessage={handleMessage}
                onClear={clearCurrentStep}
                onAdvance={goNext}
                onDownloadTranscript={downloadTranscript}
                signedUrlEndpoint={module.signedUrlEndpoint}
                persistState={persistState}
                onRetryPersist={persistTranscript}
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

