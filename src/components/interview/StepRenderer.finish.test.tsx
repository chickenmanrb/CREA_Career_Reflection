import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { TranscriptMessage } from "@/types/interview";

vi.mock("@elevenlabs/react", () => ({
  useConversation: () => ({
    startSession: vi.fn(),
    endSession: vi.fn(),
    sendUserMessage: vi.fn(),
  }),
}));

import { StepRenderer } from "./StepRenderer";

const finishStep = {
  id: "finish",
  type: "finish" as const,
  title: "Finish",
  description: "",
};

const baseMessages: TranscriptMessage[] = [
  {
    id: "1",
    source: "user",
    message: "Sample",
    timestamp: "now",
    stepId: "finish",
  },
];

describe("StepRenderer finish", () => {
  it("uses a consistent typography scale", () => {
    const html = renderToStaticMarkup(
      <StepRenderer
        step={finishStep}
        messages={baseMessages}
        allMessages={baseMessages}
        onMessage={() => {}}
        onClear={() => {}}
        onAdvance={() => {}}
        onDownloadTranscript={() => {}}
        signedUrlEndpoint="/api/test/signed-url"
      />
    );

    expect(html).toContain("text-2xl");
    expect(html).not.toContain("text-3xl");
    expect(html).not.toContain("text-xs");
    expect(html).toContain("text-base text-muted-foreground");
  });
});
