import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  questionText: z.string().min(1),
  userMessage: z.string().min(1),
  agentId: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { questionText, userMessage, agentId } = parsed.data;
  const apiKey = process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing ELEVENLABS_API_KEY" }, { status: 500 });
  }

  // ElevenLabs chat endpoint (text-only). Agents must allow text/chat.
  const payload = {
    agent_id: agentId,
    messages: [
      { role: "system", content: "You are a concise reflection coach. Keep replies under 60 words. Ask for concrete details or offer one specific improvement tied to the prompt." },
      { role: "user", content: `Prompt: ${questionText}\nUser answer: ${userMessage}` },
    ],
  };

  try {
    const resp = await fetch("https://api.elevenlabs.io/v1/convai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("ElevenLabs chat error", resp.status, text);
      return NextResponse.json({ error: "coach_failed" }, { status: 500 });
    }

    const data = await resp.json();
    // API returns { output: [{content: "..."}, ...]} or {message: "..."}
    const reply =
      (Array.isArray(data.output) && data.output[0]?.content) ||
      data.message ||
      data.reply ||
      null;
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("coach route error", error);
    return NextResponse.json({ error: "coach_failed" }, { status: 500 });
  }
}
