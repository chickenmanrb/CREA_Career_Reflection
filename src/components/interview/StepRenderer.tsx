"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { useConversation } from "@elevenlabs/react";
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
  onMessage: (message: {
    source: "user" | "ai";
    message: string;
    stepId: string;
    questionKey?: QuestionKey;
  }) => void;
  onClear: () => void;
  onAdvance: () => void;
  onDownloadTranscript?: () => void;
  allMessages?: TranscriptMessage[];
  signedUrlEndpoint: string;
  persistState?:
    | { status: "idle" }
    | { status: "saving" }
    | { status: "saved"; id?: string }
    | { status: "error"; error: string };
  onRetryPersist?: () => void;
};

async function requestSignedUrl(agentId: string, endpoint: string) {
  const response = await fetch(`${endpoint}?agentId=${encodeURIComponent(agentId)}`);
  if (!response.ok) {
    const body = await response.text().catch(() => response.statusText);
    throw new Error(`Failed to get signed URL (${response.status}): ${body}`);
  }

  const data = await response.json();
  if (!data?.signedUrl) {
    throw new Error("ElevenLabs did not return a signed URL");
  }

  return data.signedUrl as string;
}

function normalizeMessagePayload(payload: { source?: string; message?: string; text?: string }) {
  const text = payload.message ?? payload.text ?? "";
  const source =
    payload.source === "user" ? "user" : payload.source === "ai" ? "ai" : payload.source === "assistant" ? "ai" : "ai";
  return { source, message: text };
}

function messageFromError(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
}

export function StepRenderer({
  step,
  messages,
  onMessage,
  onClear,
  onAdvance,
  onDownloadTranscript,
  allMessages,
  signedUrlEndpoint,
  persistState,
  onRetryPersist,
}: StepRendererProps) {
  const [textInput, setTextInput] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [callState, setCallState] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [isAwaitingReply, setIsAwaitingReply] = useState(false);
  const questionKey = questionKeyFromStepId(step.id);

  const conversation = useConversation({
    textOnly: true,
    onMessage: (payload) => {
      const normalized = normalizeMessagePayload(payload);
      if (!normalized.message.trim()) return;
      if (normalized.source !== "ai") return;
      setIsAwaitingReply(false);
      onMessage({
        source: normalized.source,
        message: normalized.message,
        stepId: step.id,
        questionKey,
      });
    },
    onError: (error) => {
      const message = messageFromError(error, "The reflection coach is unavailable.");
      setSendError(message);
      setCallState("disconnected");
      setIsAwaitingReply(false);
    },
    onStatusChange: ({ status }) => {
      if (status === "connecting") {
        setCallState("connecting");
      } else if (status === "connected") {
        setCallState("connected");
      } else {
        setCallState("disconnected");
        setIsAwaitingReply(false);
      }
    },
  });

  const isConnected = callState === "connected";

  const startConversation = useCallback(async () => {
    if (!step.agentId) {
      setSendError("Missing agent configuration");
      return;
    }

    setIsStarting(true);
    setSendError(null);
    setCallState("connecting");
    setIsAwaitingReply(false);

    try {
      const signedUrl = await requestSignedUrl(step.agentId, signedUrlEndpoint);
      await conversation.startSession({
        signedUrl,
        connectionType: "websocket",
      });
      setIsAwaitingReply(true);
    } catch (error) {
      const message = messageFromError(error, "Unable to reach the reflection coach.");
      setSendError(message);
      setCallState("disconnected");
      setIsAwaitingReply(false);
    } finally {
      setIsStarting(false);
    }
  }, [conversation, signedUrlEndpoint, step.agentId]);

  const endConversation = useCallback(() => {
    conversation.endSession();
    setCallState("disconnected");
    setIsAwaitingReply(false);
  }, [conversation]);

  const handleSendText = useCallback(
    async (e?: FormEvent | KeyboardEvent) => {
      if (e) e.preventDefault();
      const trimmedInput = textInput.trim();
      if (!trimmedInput || !isConnected) return;

      onMessage({ source: "user", message: trimmedInput, stepId: step.id, questionKey });
      setIsAwaitingReply(true);
      setTextInput("");

      try {
        setSendError(null);
        await conversation.sendUserMessage(trimmedInput);
      } catch (error) {
        const message = messageFromError(error, "The reflection coach is unavailable.");
        setSendError(message);
        setIsAwaitingReply(false);
      }
    },
    [textInput, onMessage, step.id, questionKey, conversation, isConnected]
  );

  const toggleConversation = useCallback(async () => {
    if (isConnected || callState === "connecting") {
      endConversation();
      return;
    }

    if (!isStarting) {
      await startConversation();
    }
  }, [callState, endConversation, isConnected, isStarting, startConversation]);

  const resetConversation = useCallback(() => {
    endConversation();
    setSendError(null);
    setTextInput("");
    setIsAwaitingReply(false);
    onClear();
  }, [endConversation, onClear]);

  useEffect(() => {
    return () => {
      conversation.endSession();
    };
    // Intentional: cleanup only on unmount; conversation ref is stable inside the hook
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    conversation.endSession();
    setCallState("disconnected");
    setSendError(null);
    setTextInput("");
    setIsAwaitingReply(false);
    // Reset only when the flow step changes; avoid re-running on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  if (step.type === "intro") {
    return (
      <VideoFrame
        title="Why This Matters"
        description="Most people pursue career paths without truly understanding what the work actually entails. Job descriptions highlight responsibilities but miss the reality of daily work, the personality traits that lead to success, and the lifestyle trade-offs involved. This guided reflection helps you avoid costly mismatches by testing your understanding of acquisitions roles, correcting misconceptions, and honestly assessing whether this path aligns with who you are and what you want. The AI guide will challenge your thinking, probe your motivations, and help you understand how to position your unique background for success in this field."
      />
    );
  }

  if (step.type === "question") {
    return (
      <div className="space-y-8 text-center">
        <p className="text-sm text-muted-foreground uppercase tracking-[0.3em]">Question Prep</p>
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
    const startLabel = isConnected ? "End Reflection" : callState === "connecting" ? "Connecting..." : "Start Reflection";

    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <Button
              variant="default"
              className="rounded-full bg-[#05b6ff] px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-blue-300 hover:bg-[#0aa3e2]"
              onClick={toggleConversation}
              disabled={!step.agentId || callState === "connecting"}
            >
              {startLabel}
            </Button>
            <button
              type="button"
              onClick={resetConversation}
              className="rounded-full px-3 py-1 text-xs font-semibold text-slate-600 underline-offset-2 hover:underline disabled:opacity-60"
              disabled={messages.length === 0}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1 min-h-0">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Prompt</p>
            <h3 className="text-lg font-semibold text-slate-900">{step.questionText ?? step.title}</h3>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="text-sm font-semibold text-slate-800">Conversation</span>
          <span className="text-[11px] lowercase tracking-[0.08em] text-slate-500">Local history only</span>
        </div>
        <div className="flex-1 min-h-0">
          <Transcript messages={messages} className="min-h-0 flex-1" />
        </div>
      </div>

      {isConnected && isAwaitingReply && (
        <div className="flex items-center gap-2 text-xs text-slate-600" aria-live="polite">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-slate-500" />
          </span>
          <span>The coach is thinking...</span>
        </div>
      )}

      <div className="relative">
          <Textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleSendText(e);
              }
            }}
            placeholder={isConnected ? "Type your reflection here..." : "Click 'Start Reflection' to begin..."}
            className="min-h-[180px] resize-none pr-24 text-base"
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
        {sendError && <p className="text-xs text-rose-600">{sendError}</p>}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <button onClick={onClear} className="rounded-full border px-4 py-2 text-sm" disabled={messages.length === 0}>
            Clear transcript
          </button>
          <span>Conversation history is saved when you finish—keep writing until you feel confident.</span>
        </div>
      </div>
    );
  }

  const globalMessages = allMessages ?? messages;

  if (step.type === "finish") {
    const hasTranscript = globalMessages.length > 0;
    return (
      <div className="space-y-6">
        <div className="rounded-xl border bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Reflection complete</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#0f1729]">Congratulations on Completing Your Career Path Reflection</h2>
          <p className="mt-3 text-base text-slate-700 leading-relaxed">
            You&apos;ve just completed one of the most important exercises in career planning that most people skip entirely.
            By honestly assessing your fit, you&apos;re already ahead of candidates who chase roles without understanding what
            they&apos;re getting into.
          </p>
          <p className="mt-3 text-base text-slate-700 leading-relaxed">
            <span className="font-semibold">Why This Matters:</span> When you&apos;re crafting your story for networking
            conversations and interviews, this reflection will be helpful to leverage. The narrative you&apos;re building about
            why a particular path fits you needs to be consistent, authentic, and compelling. This exercise serves as the
            foundation for pulling this together. You&apos;ll refine this raw material in future modules.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-2xl font-semibold text-slate-800">Don&apos;t Exit Before Downloading and Saving Your Transcript</p>
            <p className="text-base text-muted-foreground">This conversation contains insights you&apos;ll need as you move forward.</p>
            {persistState?.status === "saving" && (
              <p className="mt-2 text-sm text-slate-600">Saving transcript...</p>
            )}
            {persistState?.status === "saved" && (
              <p className="mt-2 text-sm text-emerald-700">Transcript saved.</p>
            )}
            {persistState?.status === "error" && (
              <div className="mt-2 text-sm text-rose-700">
                <div>Could not save transcript: {persistState.error}</div>
                {onRetryPersist && (
                  <button onClick={onRetryPersist} className="mt-2 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-muted">
                    Retry save
                  </button>
                )}
              </div>
            )}
          </div>
          <Button
            variant="default"
            className="rounded-full bg-[#05b6ff] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-[#0aa3e2]"
            onClick={onDownloadTranscript}
            disabled={!hasTranscript}
          >
            Download transcript
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
