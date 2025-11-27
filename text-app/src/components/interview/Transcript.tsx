"use client";

import type { TranscriptMessage } from "@/types/interview";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ui/conversation";
import { cn } from "@/lib/utils";

type TranscriptProps = {
  messages: TranscriptMessage[];
};

export function Transcript({ messages }: TranscriptProps) {
  return (
    <Conversation className="rounded-xl border bg-background/50">
      <ConversationContent className="flex flex-col gap-3 p-4">
        {messages.length === 0 ? (
          <ConversationEmptyState
            title="No messages yet"
            description="Start the conversation to capture the transcript."
          />
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.source === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-4 py-2 text-sm shadow-sm",
                  msg.source === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                <p className="leading-relaxed">{msg.message}</p>
                {msg.timestamp && (
                  <span className="mt-1 block text-[10px] opacity-70">
                    {msg.timestamp}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
