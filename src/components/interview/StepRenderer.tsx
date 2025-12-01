"use client";

import { useState, useRef, useCallback } from "react";
import { SendIcon } from "lucide-react";

import { Transcript } from "@/components/interview/Transcript";
import { VideoFrame } from "@/components/ui/video-frame";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FlowStep } from "@/types/flow";
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

type StepRendererProps = {
  step: FlowStep;
  messages: TranscriptMessage[];
  onMessage: (message: { source: "user" | "ai"; message: string }) => void;
  onClear: () => void;
  onAdvance: () => void;
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
  onMessage,
  onClear,
  onAdvance,
}: StepRendererProps) {
  const [textInput, setTextInput] = useState("");
  const [callState, setCallState] = useState<"disconnected" | "connected">("disconnected");
  const isConnected = callState === "connected";
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const aiMessages = messages.filter(
    (msg) => msg.source === "ai" && msg.questionKey === questionKeyFromStepId(step.id)
  );
  const latestAiMessage = aiMessages[aiMessages.length - 1];
  const [coachLoading, setCoachLoading] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

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

  if (step.type === "intro") {
    return (
      <VideoFrame
        title="Why This Matters"
        description="Clarify your fit and interests through six written prompts. You’ll write answers, get light AI nudges plus structured feedback to spot strengths, gaps, and next actions."
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
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border bg-gradient-to-br from-slate-50 via-white to-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              <span>AI Prompt</span>
            </div>
            <p className="mt-2 text-xl font-semibold text-slate-900 leading-relaxed">
              {latestAiMessage?.message ?? "Click Start Your Response to get the first AI nudge."}
            </p>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              {latestAiMessage?.timestamp ? <span>Last update: {latestAiMessage.timestamp}</span> : <span>&nbsp;</span>}
              {coachLoading ? <span>Thinking...</span> : null}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Button
                variant="default"
                className="rounded-full bg-[#05b6ff] px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#0aa3e2]"
                onClick={handleStartOrEnd}
              >
                {isConnected ? "End Reflection" : "Start Your Response"}
              </Button>
              <button
                type="button"
                onClick={resetConversation}
                className="rounded-full px-3 py-1 text-xs font-semibold text-slate-600 underline-offset-2 hover:underline disabled:opacity-60"
                disabled={!isConnected && messages.length > 0}
              >
                Reset
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Write, send, and get a tailored follow-up. Use the nav on the right to move between prompts.
            </p>
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
              placeholder={isConnected ? "Type your reflection here..." : "Click 'Start Your Response' to begin..."}
              className="min-h-[340px] resize-none pr-24 text-base"
              disabled={!isConnected}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSendText}
              disabled={!textInput.trim() || !isConnected}
              className="absolute right-3 bottom-3 h-9 px-3 text-sm font-semibold rounded-full"
            >
              <SendIcon className="h-4 w-4 mr-1" /> Send
            </Button>
          </div>

          <div className="w-full rounded-lg border bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">Transcript</span>
              <button
                type="button"
                onClick={() => setShowTranscript((v) => !v)}
                className="text-xs font-semibold text-slate-600 underline-offset-2 hover:underline"
              >
                {showTranscript ? "Hide" : "Show"}
              </button>
            </div>
            {showTranscript ? (
              <div className="mt-3">
                <Transcript messages={messages} />
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-500">Collapsed. Click “Show” to review the chat.</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <button
            onClick={onClear}
            className="rounded-full border px-4 py-2 text-sm"
            disabled={messages.length === 0}
          >
            Clear transcript
          </button>
          <span>Conversation history is local—keep writing until you feel confident.</span>
        </div>
      </div>
    );
  }

  return null;
}
