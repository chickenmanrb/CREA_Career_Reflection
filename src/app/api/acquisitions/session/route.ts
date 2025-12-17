import { NextResponse } from "next/server";

import { persistReflectionSession, persistSessionBodySchema } from "@/lib/reflection/persist-session";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = persistSessionBodySchema.parse(json);

    const data = await persistReflectionSession({
      table: "reflection_sessions",
      agentId: "acquisitions",
      exercise: "acquisitions",
      body,
    });

    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
