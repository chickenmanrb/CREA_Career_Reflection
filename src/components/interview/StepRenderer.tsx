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
};

async function requestSignedUrl(agentId: string) {
  const response = await fetch(`/api/coach/signed-url?agentId=${encodeURIComponent(agentId)}`);
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

export function StepRenderer({
  step,
  messages,
  onMessage,
  onClear,
  onAdvance,
  onDownloadTranscript,
  allMessages,
}: StepRendererProps) {
  const [textInput, setTextInput] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [callState, setCallState] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const questionKey = questionKeyFromStepId(step.id);

  const conversation = useConversation({
    textOnly: true,
    onMessage: (payload) => {
      const normalized = normalizeMessagePayload(payload);
      if (!normalized.message.trim()) return;
      if (normalized.source !== "ai") return;
      onMessage({
        source: normalized.source,
        message: normalized.message,
        stepId: step.id,
        questionKey,
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "The reflection coach is unavailable.";
      setSendError(message);
      setCallState("disconnected");
    },
    onStatusChange: ({ status }) => {
      if (status === "connecting") {
        setCallState("connecting");
      } else if (status === "connected" || status === "transcribing") {
        setCallState("connected");
      } else {
        setCallState("disconnected");
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

    try {
      const signedUrl = await requestSignedUrl(step.agentId);
      await conversation.startSession({
        signedUrl,
        connectionType: "websocket",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reach the reflection coach.";
      setSendError(message);
      setCallState("disconnected");
    } finally {
      setIsStarting(false);
    }
  }, [conversation, step.agentId]);

  const endConversation = useCallback(() => {
    conversation.endSession();
    setCallState("disconnected");
  }, [conversation]);

  const handleSendText = useCallback(
    async (e?: FormEvent | KeyboardEvent) => {
      if (e) e.preventDefault();
      const trimmedInput = textInput.trim();
      if (!trimmedInput || !isConnected) return;

      onMessage({ source: "user", message: trimmedInput, stepId: step.id, questionKey });
      setTextInput("");

      try {
        setSendError(null);
        await conversation.sendUserMessage(trimmedInput);
      } catch (error) {
        const message = error instanceof Error ? error.message : "The reflection coach is unavailable.";
        setSendError(message);
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
    // Reset only when the flow step changes; avoid re-running on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

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
          <span>Conversation history is local—keep writing until you feel confident.</span>
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
          <h2 className="text-3xl font-semibold text-[#0f1729]">Congratulations on Reflecting</h2>
          <p className="mt-3 text-base text-slate-700 leading-relaxed">
            Congratulations on reflecting on your career path. This exercise is an important part of the process
            that many people fail to take on. Connecting your objectives and your values to your chosen path is the
            difference between a job and a career that you love. Continue thinking about this and feel free to revisit
            this exercise if you want a refresher.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Download Transcript</p>
            <p className="text-xs text-muted-foreground">
              Click to save a copy of the full transcript from all six prompts.
            </p>
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
