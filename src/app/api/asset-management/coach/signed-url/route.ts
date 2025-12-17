import { NextResponse } from "next/server";

import { fetchSignedUrl } from "@/lib/elevenlabs";
import { assetManagementFlowConfig } from "@/lib/flow-config-asset-management";

function allowedAgentIds() {
  return assetManagementFlowConfig.steps
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
    return NextResponse.json({ error: "Agent not allowed for asset management" }, { status: 403 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing ELEVENLABS_API_KEY" }, { status: 500 });
  }

  try {
    const signedUrl = await fetchSignedUrl(agentId, apiKey);
    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error("asset-management signed-url error", error);
    return NextResponse.json({ error: "Unable to fetch signed URL" }, { status: 500 });
  }
}

