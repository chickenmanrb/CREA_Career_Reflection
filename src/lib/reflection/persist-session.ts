import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const transcriptMessageSchema = z.object({
  id: z.string().min(1),
  source: z.enum(["user", "ai"]),
  message: z.string(),
  timestamp: z.string().optional(),
  stepId: z.string().optional(),
  questionKey: z.string().optional(),
});

export const persistSessionBodySchema = z.object({
  candidateName: z.string().trim().min(1).optional(),
  candidateEmail: z.string().trim().email().optional(),
  transcript: z.array(transcriptMessageSchema).min(1),
});

export type PersistSessionBody = z.infer<typeof persistSessionBodySchema>;

export async function persistReflectionSession(params: {
  table: string;
  agentId: string;
  body: PersistSessionBody;
}) {
  const supabase = getSupabaseAdmin();
  const { table, agentId, body } = params;

  const insertPayload = {
    agent_id: agentId,
    candidate_name: body.candidateName ?? null,
    candidate_email: body.candidateEmail ?? null,
    transcript: body.transcript,
  };

  const { data, error } = await supabase.from(table).insert(insertPayload).select("id").single();
  if (error) throw error;
  return data;
}

