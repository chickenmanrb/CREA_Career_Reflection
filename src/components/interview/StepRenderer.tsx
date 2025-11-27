"use client";

import { useState, useRef, useCallback } from "react";
import { SendIcon } from "lucide-react";

import { ScoreCard } from "@/components/interview/ScoreCard";
import { VideoFrame } from "@/components/ui/video-frame";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FlowStep } from "@/types/flow";
import type { GeminiAnalysis, QuestionKey, TranscriptMessage } from "@/types/interview";

const orderedQuestionKeys: QuestionKey[] = [
  "q1_attracts",
  "q2_concerns",
  "q3_questions",
  "q4_direct_skills",
  "q5_improve_skills",
  "q6_connect",
];

const questionLabels: Record<QuestionKey, string> = {
  q1_attracts: "Attraction to pathway",
  q2_concerns: "Concerns/Risks",
  q3_questions: "Questions/Curiosities",
  q4_direct_skills: "Directly Applicable Skills",
  q5_improve_skills: "Improvement Areas",
  q6_connect: "Networking Strategy",
};

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

type StepRendererProps = {
  step: FlowStep;
  messages: TranscriptMessage[];
  score: GeminiAnalysis | null;
  loadingScore: boolean;
  status: string | null;
  onMessage: (message: { source: "user" | "ai"; message: string }) => void;
  onScore: () => void;
  onClear: () => void;
  onAdvance: () => void;
  provider: "openai" | "anthropic";
};

async function fetchCoachReply(questionText: string | undefined, userMessage: string, agentId: string) {
  const res = await fetch("/api/coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      questionText: questionText ?? "Reflection prompt",
      userMessage,
      agentId,
    }),
  });
  if (!res.ok) throw new Error("coach_request_failed");
  const data = await res.json();
  return (data?.reply as string | undefined)?.trim();
}

export function StepRenderer({
  step,
  messages,
  score,
  loadingScore,
  status,
  onMessage,
  onScore,
  onClear,
  onAdvance,
  provider,
}: StepRendererProps) {
  void provider;
  const questionKey = questionKeyFromStepId(step.id);
  const showAllScores = step.id === "final-review";

  const [textInput, setTextInput] = useState("");
  const [callState, setCallState] = useState<"disconnected" | "connected">("disconnected");
  const isConnected = callState === "connected";
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const aiMessages = messages.filter((msg) => msg.source === "ai" && msg.questionKey === questionKey);
  const latestAiMessage = aiMessages[aiMessages.length - 1];
  const [coachLoading, setCoachLoading] = useState(false);

  const startConversation = useCallback(() => {
    setCallState("connected");
    if (step.questionText) {
      onMessage({ source: "ai", message: `Welcome! Let's discuss: ${step.questionText}` });
    }
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [onMessage, step.questionText]);

  const endConversation = useCallback(() => {
    setCallState("disconnected");
  }, []);

  const handleSendText = useCallback(
    async (e?: React.FormEvent | React.KeyboardEvent) => {
      if (e) e.preventDefault();
      const trimmedInput = textInput.trim();
      if (!trimmedInput) return;

      onMessage({ source: "user", message: trimmedInput });
      setTextInput("");

      const agentId = step.agentId ?? "";
      try {
        setCoachLoading(true);
        const reply = await fetchCoachReply(step.questionText, trimmedInput, agentId);
        if (reply) {
          onMessage({ source: "ai", message: reply });
        } else {
          onMessage({ source: "ai", message: "Add one concrete example or detail to strengthen that point." });
        }
      } catch (err) {
        console.warn("coach fallback", err);
        onMessage({ source: "ai", message: "Give one specific example or add a next step to deepen this answer." });
      } finally {
        setCoachLoading(false);
      }
    },
    [textInput, onMessage, step.agentId, step.questionText]
  );

  const handleStartOrEnd = useCallback(() => {
    if (isConnected) {
      endConversation();
    } else {
      startConversation();
    }
  }, [isConnected, endConversation, startConversation]);

  const resetConversation = useCallback(() => {
    endConversation();
    onClear();
  }, [endConversation, onClear]);

  const downloadCsv = useCallback(() => {
    if (!score) return;
    const headers = [
      "Question",
      "Content",
      "Communication clarity",
      "Conciseness & efficiency",
      "Specificity",
      "Strengths",
      "Weaknesses",
    ];

    const toCsvValue = (value: string | number) => {
      const str = typeof value === "string" ? value : String(value);
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rows = orderedQuestionKeys.map((key) => {
      const data = score.questions[key];
      return [
        questionLabels[key],
        data?.score_content ?? "",
        data?.score_communication_clarity ?? "",
        data?.score_conciseness_efficiency ?? "",
        data?.score_specificity ?? "",
        (data?.strengths ?? []).join("; "),
        (data?.weaknesses ?? []).join("; "),
      ];
    });

    const csv = [headers, ...rows]
      .map((row) => row.map(toCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "reflection-report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [score]);

  if (step.type === "intro") {
    return (
      <VideoFrame
        title="Why This Matters"
        description="Clarify your fit and interests through six written prompts. You’ll get quick AI nudges plus structured feedback to spot strengths, gaps, and next actions."
      />
    );
  }

  if (step.type === "question") {
    return (
      <div className="space-y-8 text-center">
        <p className="text-sm text-muted-foreground uppercase tracking-wider">Question Prep</p>
        <h2 className="text-2xl font-semibold text-[#0f1729]">{step.questionText}</h2>
        <div className="flex justify-center">
          <Button
            className="rounded-full bg-[#05b6ff] px-6 py-3 text-white hover:bg-[#0aa3e2]"
            onClick={onAdvance}
          >
            Ready To Reflect
          </Button>
        </div>
      </div>
    );
  }

  if (step.type === "agent") {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <Button
            variant="default"
            className="rounded-full bg-[#05b6ff] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#0aa3e2]"
            onClick={handleStartOrEnd}
          >
            {isConnected ? "End Reflection" : "Begin Reflection"}
          </Button>

          <button
            type="button"
            onClick={resetConversation}
            className="text-xs font-semibold text-slate-600 underline-offset-2 hover:underline disabled:opacity-60"
            disabled={!isConnected && messages.length > 0}
          >
            Reset conversation
          </button>
          <p className="text-xs text-muted-foreground text-center md:text-left">
            Write your answer, send it, and wait for a brief simulated follow-up from the AI. Click &quot;End Reflection&quot; when you are satisfied with your answer, then click &quot;Score transcript&quot; to get detailed feedback.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border bg-gradient-to-br from-slate-50 via-white to-slate-100 p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">AI prompt</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 leading-relaxed">
              {latestAiMessage?.message ?? "Click Begin Reflection to get the first AI nudge."}
            </p>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              {latestAiMessage?.timestamp ? <span>Last update: {latestAiMessage.timestamp}</span> : <span>&nbsp;</span>}
              {coachLoading ? <span>Thinking...</span> : null}
            </div>
          </div>

          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  handleSendText(e);
                }
              }}
              placeholder={isConnected ? "Enter your reflection here..." : "Click 'Begin Reflection' to start..."}
              className="min-h-[320px] resize-none pr-12 text-base"
              disabled={!isConnected}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSendText}
              disabled={!textInput.trim() || !isConnected}
              className="absolute right-3 bottom-3 h-8 w-8"
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-full">
            <ScoreCard score={score} loading={loadingScore} questionKey={questionKey} showAll={showAllScores} />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="text-sm text-muted-foreground">
            {status ?? "When you finish the reflection, score the transcript."}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClear}
              className="rounded-md border px-4 py-2 text-sm"
              disabled={loadingScore}
            >
              Clear transcript
            </button>
            <button
              onClick={onScore}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              disabled={loadingScore || messages.length === 0}
            >
              {loadingScore ? "Scoring..." : "Score transcript"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step.type === "review") {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">{step.title}</h2>
            <p className="text-sm text-muted-foreground">Review the scoring results below.</p>
          </div>
          {step.id === "final-review" ? (
            <Button
              variant="outline"
              onClick={downloadCsv}
              disabled={!score || loadingScore}
            >
              Download CSV report
            </Button>
          ) : null}
        </div>
        <div className="space-y-4">
          <ScoreCard score={score} loading={loadingScore} questionKey={questionKey} showAll={showAllScores} />
          {step.id === "final-review" ? (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              <h3 className="text-base font-semibold text-foreground">Understanding Your Scores</h3>
              <div className="mt-2 space-y-2">
                <div>
                  <p className="font-medium text-foreground">General Scoring Guidance:</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li>Score below 6: Needs meaningful refinement before sharing with mentors, managers, or recruiters.</li>
                    <li>Score 6–8: Solid but could be sharper—tighten specifics and structure.</li>
                    <li>Score 8+: Clear, specific, and well-aligned—strong for networking or applications.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground">Important Context:</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li>Role level: Analyst expectations differ from Associate or VP-level roles.</li>
                    <li>Market competitiveness: Top-tier institutional firms set a higher bar than regional owner-operators.</li>
                    <li>Firm priorities: Different teams weight technical skills, cultural fit, and competencies differently.</li>
                    <li>Conversation stage: Early networking chats differ from final-round interviews.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground">Remember:</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li>Interview performance is cumulative; one weaker answer can be offset elsewhere.</li>
                    <li>Cultural fit and personality alignment matter beyond what scores capture.</li>
                    <li>Use these scores as diagnostics to target improvements before real conversations.</li>
                    <li>Practice and iteration build momentum—multiple mock sessions surface performance patterns.</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return null;
}
