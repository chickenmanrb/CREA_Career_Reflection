import { NextResponse } from "next/server";

import { fetchSignedUrl } from "@/lib/elevenlabs";
import { acquisitionsFlowConfig } from "@/lib/flow-config-acquisitions";

function allowedAgentIds() {
  return acquisitionsFlowConfig.steps
    .filter((s) => s.type === "agent")
    .map((s) => s.agentId)
    .filter((id): id is string => typeof id === "string" && id.trim().length > 0);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agentId")?.trim() || "";
  if (!agentId) {
    return NextResponse.json({ error: "Missing agentId" }, { status: 400 });
  }

  const allowed = new Set(allowedAgentIds());
  if (!allowed.has(agentId)) {
    return NextResponse.json({ error: "Agent not allowed for acquisitions" }, { status: 403 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing ELEVENLABS_API_KEY" }, { status: 500 });
  }

  try {
    const signedUrl = await fetchSignedUrl(agentId, apiKey);
    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error("acquisitions signed-url error", error);
    return NextResponse.json({ error: "Unable to fetch signed URL" }, { status: 500 });
  }
}

