# ElevenLabs Mock Interview

Voice mock interview UI using ElevenLabs Conversation Bar + Conversation components, LLM rubric scoring, and Supabase persistence.

## Setup
1) Install deps: `npm install`
2) Env vars in `.env.local` (examples in `.env.example` and `.env.local.example`):
```
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id
NEXT_PUBLIC_ELEVENLABS_AGENT_2_ID=agent_two_id
NEXT_PUBLIC_ELEVENLABS_AGENT_3_ID=agent_three_id
NEXT_PUBLIC_ELEVENLABS_AGENT_4_ID=agent_four_id
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_public_key   # if required by @elevenlabs/react
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
# Model provider selection (one of: openai | anthropic)
DEFAULT_MODEL_PROVIDER=openai
OPENAI_API_KEY=...
OPENAI_MODEL=your_openai_model_name
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=your_anthropic_model_name
```
3) Supabase tables: see `roadmap.md` for SQL.
4) Run dev server: `npm run dev` then open http://localhost:3000 (interview page at `/interview`).

## Key Files
- `src/app/interview/page.tsx` — main experience with ConversationBar, transcript, scoring control.
- `src/app/api/score/route.ts` — scores transcript via LLM and saves to Supabase.
- `src/lib/rubric.ts` — rubric definition, prompt, schema, fallback scoring.
- `src/lib/supabase.ts` — service-role client helper.
- `src/components/ui/*` — ElevenLabs UI components (Conversation, ConversationBar, etc.).

See `roadmap.md` for the full implementation plan.
