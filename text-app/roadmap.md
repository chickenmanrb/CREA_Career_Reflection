# Roadmap: ElevenLabs Mock Interview App

## Goal
Voice mock interview UI powered by an ElevenLabs agent; capture transcript, score with an LLM against a rubric, then persist scores/transcripts to Supabase.

## Deliverables
- Next.js 14 App Router project (TypeScript).
- ElevenLabs UI components (ConversationBar + Conversation) wired to a configured agent.
- Scoring API route that calls an LLM with a strict rubric prompt + JSON schema validation.
- Supabase persistence for sessions and scores.
- Basic visualization of transcript + score breakdown.

## Prerequisites
- Accounts/keys: `ELEVENLABS_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `LLM_API_KEY`.
- Node 18+; Supabase project; an ElevenLabs ConvAI Agent ID (create in dashboard or via SDK).

## Stack & Libraries
- Frontend: Next.js 14 (App Router), `@elevenlabs/react`, ElevenLabs UI kit (shadcn-based), Tailwind (from CLI install), Zod for validation.
- Backend: Next.js API routes (edge/server), `@supabase/supabase-js`, chosen LLM client (OpenAI/Anthropic/etc.).
- Optional: `@elevenlabs/elevenlabs-js` if creating/updating agents programmatically.

## Supabase Schema (SQL)
```sql
create table interview_sessions (
  id uuid primary key default gen_random_uuid(),
  agent_id text,
  candidate_name text,
  started_at timestamptz default now(),
  ended_at timestamptz,
  transcript jsonb,       -- [{source: 'user'|'ai', message: '...'}]
  raw_audio_url text,     -- optional if you persist recordings
  created_at timestamptz default now()
);

create table interview_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references interview_sessions(id) on delete cascade,
  rubric_version text,
  scores jsonb,           -- {communication: 4, clarity: 3, ...}
  total numeric,
  model_used text,
  reasoning text,
  created_at timestamptz default now()
);
```

## Project Structure (proposed)
- `app/interview/page.tsx` — main UI with ConversationBar + transcript + controls + ScoreCard.
- `components/interview/Transcript.tsx` — renders messages via Conversation + ConversationContent.
- `components/interview/ScoreCard.tsx` — rubric breakdown.
- `lib/supabase.ts` — server client factory.
- `lib/rubric.ts` — rubric definition + Zod schema for LLM response.
- `lib/elevenlabs.ts` — (optional) helper for agent CRUD or conversation helpers.
- `app/api/score/route.ts` — accepts transcript, calls LLM, validates, inserts into Supabase, returns scores.
- `app/api/session/route.ts` — (optional) start/end session bookkeeping.

## Setup Steps (A–Z)
1) Init project  
```bash
npx create-next-app@latest mock-interview --ts --app --eslint
cd mock-interview
```
2) Install deps  
```bash
npm i @elevenlabs/react @supabase/supabase-js zod
# add your LLM client, e.g.
npm i openai
```
3) Add ElevenLabs UI components  
```bash
npx @elevenlabs/agents-cli@latest components add conversation
# also pulls Conversation, ConversationBar, styles; ensure tailwind config is merged.
```
4) Configure Tailwind (if not added by CLI) and global styles per ElevenLabs UI instructions.
5) Create `.env.local` with `ELEVENLABS_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `LLM_API_KEY`.
6) Add Supabase DDL (run in Supabase SQL editor) for tables above.
7) Build `lib/supabase.ts` using service role for server-side inserts.
8) Build `lib/rubric.ts` with rubric text and Zod schema for model output (strict JSON).
9) Build UI page (`app/interview/page.tsx`):
   - Render `ConversationBar` with `agentId` from config.
   - Handle `onMessage` to append `{source, message, timestamp}` to local state.
   - Display transcript via `Conversation` + `ConversationContent`; show `ConversationScrollButton`.
   - Add Start/End controls, duration guard, and a “Score Interview” action.
10) Implement `/api/score/route.ts`:
    - Validate payload (sessionId?, transcript[]).
    - Call LLM with rubric prompt; enforce JSON mode or tool-calling if available.
    - Parse/validate with Zod; upsert `interview_sessions` (if not saved yet) and insert `interview_scores`.
    - Return `{scores, total, reasoning}`.
11) (Optional) Implement `/api/session/route.ts` to create/end sessions early and save transcript while user talks.
12) Display results in `ScoreCard` component on the client after scoring response.
13) Optional audio: if you capture audio URLs (from storage), show `AudioPlayerProvider` + `AudioPlayer` controls.
14) Add error states/toasts for Connect/Disconnect/Error callbacks on `ConversationBar`.
15) Add basic tests:
    - Rubric validator with fixture transcript.
    - API route unit test with mocked LLM + mocked Supabase client.
16) Lint/format and run Next dev.
17) Deploy (Vercel or similar); configure env vars; ensure Supabase service key stored as encrypted secret.

## ElevenLabs Agent Setup
- Easiest: create ConvAI Agent in ElevenLabs dashboard; note `agentId`.
- Programmatic (optional): use `@elevenlabs/elevenlabs-js`:
```ts
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
await client.conversationalAi.agents.create({
  name: "Mock Interviewer",
  conversationConfig: {
    agent: {
      prompt: { prompt: "You are the interviewer. Ask behavioral/role-specific questions." },
      firstMessage: "Welcome to the mock interview. Ready to begin?",
      language: "en",
    },
    tts: { voiceId: "your-voice-id", modelId: "eleven_turbo_v2_5" },
  },
});
```
- In the UI, use `agentId` only; do not expose API keys client-side.

## Scoring Prompt Sketch (LLM)
- System: “You score interview transcripts. Use this rubric: {dimensions 1–5 with descriptions}. Return JSON: `{ communication: int, clarity: int, domain: int, structure: int, rapport: int, total: int, reasoning: string }`. No prose.”
- Provide transcript as ordered Q/A pairs. Use JSON mode or tool calling. Validate with Zod before saving.

## Security Notes
- Keep Supabase service role key server-side only.
- Never expose ElevenLabs API key to client; client uses `agentId` with ConversationBar WebRTC flow.
- Validate and sanitize transcripts before storage; cap transcript size.

## Observability
- Log connect/disconnect/error events from `ConversationBar`.
- Capture latency metrics if you add `callbackLatencyMeasurement` using `Conversation` class.
- Add Supabase row-level observability via logs or Pg functions if needed.

## Next Actions (to start implementation)
1) Run create-next-app + install deps (steps 1–3).
2) Set env vars and Supabase schema (steps 5–6).
3) Build `lib` helpers + API routes (`supabase`, `rubric`, `score`).
4) Implement interview page with ConversationBar + Transcript + ScoreCard.
5) Test with stubbed LLM, then wire real key, then deploy. 
