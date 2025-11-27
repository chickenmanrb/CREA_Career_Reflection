"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";

import { StepRenderer } from "@/components/interview/StepRenderer";
import { LeftNav } from "@/components/layout/LeftNav";
import { Card, CardContent } from "@/components/ui/card";
import { flowConfig } from "@/lib/flow-config";
import type { GeminiAnalysis, QuestionKey, TranscriptMessage } from "@/types/interview";

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
const AGENT_ID = "";
function emptyScore(): GeminiAnalysis {
  const base = {
    score_content: 0,
    score_communication_clarity: 0,
    score_conciseness_efficiency: 0,
    score_specificity: 0,
    strengths: [] as string[],
    weaknesses: [] as string[],
  };
  return {
    questions: {
      q1_attracts: { ...base },
      q2_concerns: { ...base },
      q3_questions: { ...base },
      q4_direct_skills: { ...base },
      q5_improve_skills: { ...base },
      q6_connect: { ...base },
    },
  };
}

export default function InterviewPage() {
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [score, setScore] = useState<GeminiAnalysis | null>(null);
  const [loadingScore, setLoadingScore] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [provider, setProvider] = useState<"openai" | "anthropic">("anthropic");
  const [currentStepId, setCurrentStepId] = useState<string>(flowConfig.steps[0]?.id ?? "");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");

  useEffect(() => {
    const storedName = typeof window !== "undefined" ? localStorage.getItem("crea_candidate_name") : "";
    const storedEmail = typeof window !== "undefined" ? localStorage.getItem("crea_candidate_email") : "";
    if (storedName) setCandidateName(storedName);
    if (storedEmail) setCandidateEmail(storedEmail);
  }, []);

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

  const handleScore = async () => {
    if (messages.length === 0) {
      setStatus("Transcript is empty. Enter an answer first.");
      return;
    }

    setStatus(null);
    setLoadingScore(true);

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: messages,
          agentId: AGENT_ID,
          candidateName,
          candidateEmail,
          provider,
          questionKey: questionKeyFromStepId(currentStepId),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to score transcript");
      }

      const result: GeminiAnalysis = data.scores;
      const questionKey = questionKeyFromStepId(currentStepId);

      // If scoring a single question, merge into aggregate score object.
      if (questionKey) {
        setScore((prev) => {
          const base = prev ?? emptyScore();
          return {
            questions: {
              ...base.questions,
              [questionKey]: result.questions[questionKey],
            },
          };
        });
      } else {
        setScore(result);
      }
      setStatus("Scored successfully.");
    } catch (error) {
      console.error(error);
      setStatus(
        error instanceof Error ? error.message : "Unable to score transcript."
      );
    } finally {
      setLoadingScore(false);
    }
  };

  const currentStep = useMemo(
    () => flowConfig.steps.find((s) => s.id === currentStepId) ?? flowConfig.steps[0],
    [currentStepId]
  );

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
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 md:py-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold">Career Pathway Reflection</h1>
              <p className="text-muted-foreground max-w-2xl text-sm">
                Three steps to each prompt: 1) Prep 2) Write your answer 3) Scoring & Feedback.
              </p>
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
                  Step {currentIdx + 1} of {stepsForNav.length}
                </span>
                <button
                  onClick={goNext}
                  className="rounded-full border px-3 py-2 text-xs font-semibold hover:bg-muted disabled:opacity-40"
                  disabled={currentIdx === stepsForNav.length - 1}
                >
                  Next
                </button>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-medium text-foreground">
                <label className="flex items-center gap-2">
                  Model provider
                  <select
                    className="rounded-md border px-2 py-1 text-xs"
                    value={provider}
                    onChange={(e) =>
                      setProvider(e.target.value === "anthropic" ? "anthropic" : "openai")
                    }
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Claude</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          {!agentConfigured && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-dashed bg-amber-50 p-4 text-amber-900">
              <AlertCircle className="h-5 w-5" />
              <div className="text-sm">
                Agent IDs are optional in text-only mode. You can still practice and score responses.
              </div>
            </div>
          )}

          <Card className="border border-primary/10 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="space-y-6">
              <StepRenderer
                step={currentStep}
                messages={messages}
                score={score}
                loadingScore={loadingScore}
                status={status}
                onMessage={handleMessage}
                onScore={handleScore}
                onClear={() => {
                  setMessages([]);
                  setScore(emptyScore());
                }}
                onAdvance={goNext}
                provider={provider}
              />
            </CardContent>
          </Card>

        </main>
      </div>
    </div>
  );
}
