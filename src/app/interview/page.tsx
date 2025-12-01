"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";

import { StepRenderer } from "@/components/interview/StepRenderer";
import { LeftNav } from "@/components/layout/LeftNav";
import { Card, CardContent } from "@/components/ui/card";
import { flowConfig } from "@/lib/flow-config";
import type { QuestionKey, TranscriptMessage } from "@/types/interview";

function questionKeyFromStepId(stepId: string): QuestionKey | undefined {
  const match = stepId.match(/^q(\d)-/);
  if (!match) return undefined;
  const num = match[1];
  if (num === "1") return "q1_attracts";
  if (num === "2") return "q2_concerns";
  if (num === "3") return "q3_questions";
  if (num === "4") return "q4_direct_skills";
  if (num === "5") return "q5_improve_skills";
  if (num === "6") return "q6_connect";
  return undefined;
}

// Text-only mode: agent IDs are kept in the flow for reference but not required here.
export default function InterviewPage() {
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [currentStepId, setCurrentStepId] = useState<string>(flowConfig.steps[0]?.id ?? "");

  // Check if we have any Agent IDs configured in flow-config for the new steps
  const agentConfigured = flowConfig.steps.some((s) => s.type === "agent" && s.agentId && s.agentId.length > 0);

  const handleMessage = (message: { source: "user" | "ai"; message: string }) => {
    const questionKey = questionKeyFromStepId(currentStepId);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        source: message.source,
        message: message.message,
        timestamp: new Date().toLocaleTimeString(),
        stepId: currentStepId,
        questionKey,
      },
    ]);
  };

  const currentStep = useMemo(
    () => flowConfig.steps.find((s) => s.id === currentStepId) ?? flowConfig.steps[0],
    [currentStepId]
  );

  // Progress: use prompt count (agents) instead of total steps to avoid confusion.
  const promptSteps = useMemo(() => flowConfig.steps.filter((s) => s.type === "agent"), []);
  const currentPromptNumber = useMemo(() => {
    const match = currentStepId.match(/^q(\d)-/);
    return match ? Number(match[1]) : null;
  }, [currentStepId]);
  const totalPrompts = promptSteps.length;

  const stepsForNav = useMemo(() => flowConfig.steps, []);
  const currentIdx = Math.max(0, stepsForNav.findIndex((s) => s.id === currentStepId));
  const goPrev = () => {
    if (currentIdx > 0) {
      setCurrentStepId(stepsForNav[currentIdx - 1].id);
    }
  };

  const goNext = () => {
    if (currentIdx < stepsForNav.length - 1) {
      setCurrentStepId(stepsForNav[currentIdx + 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <header className="flex items-center justify-between bg-[#0f1729] px-5 py-3 text-white shadow">
        <div className="flex items-center gap-3">
          <Image src="/assets/CRE logo.webp" alt="CRE Analyst" width={120} height={32} className="h-8 w-auto" />
          <div className="text-sm font-semibold tracking-wide">Career Pathway Reflection</div>
        </div>
        <div className="text-xs font-semibold text-white/80">creanalyst.com</div>
      </header>

        <div className="flex min-h-[calc(100vh-56px)]">
        <LeftNav steps={stepsForNav} currentId={currentStep.id} onSelect={setCurrentStepId} />
        <main className="flex flex-1 flex-col overflow-y-auto px-6 py-8 md:px-8 md:py-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold">Career Pathway Reflection</h1>
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
              <div className="text-sm">
                Agent IDs are optional in text-only mode. You can still practice the prompts using the text coach.
              </div>
            </div>
          )}

          <Card className="border border-primary/10 bg-gradient-to-br from-primary/5 to-background flex flex-1 flex-col">
            <CardContent className="space-y-6 flex flex-1 flex-col">
              <StepRenderer
                step={currentStep}
                messages={messages}
                onMessage={handleMessage}
                onClear={() => setMessages([])}
                onAdvance={goNext}
              />
            </CardContent>
          </Card>

        </main>
      </div>
    </div>
  );
}
