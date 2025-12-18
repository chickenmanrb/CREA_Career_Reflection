import { NextResponse } from "next/server";

import { fetchSignedUrl } from "@/lib/elevenlabs";
import { resolveAgentIds } from "@/lib/reflection/agents";
import { getReflectionModule } from "@/lib/reflection/modules";

function allowedAgentIds() {
  const moduleConfig = getReflectionModule("brokerage");
  return resolveAgentIds(moduleConfig).filter((id) => id.trim().length > 0);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agentId")?.trim() || "";
  if (!agentId) {
    return NextResponse.json({ error: "Missing agentId" }, { status: 400 });
  }

  const allowed = new Set(allowedAgentIds());
  if (!allowed.has(agentId)) {
    return NextResponse.json({ error: "Agent not allowed for capital markets brokerage" }, { status: 403 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing ELEVENLABS_API_KEY" }, { status: 500 });
  }

  try {
    const signedUrl = await fetchSignedUrl(agentId, apiKey);
    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error("capital-markets-brokerage signed-url error", error);
    return NextResponse.json({ error: "Unable to fetch signed URL" }, { status: 500 });
  }
}

