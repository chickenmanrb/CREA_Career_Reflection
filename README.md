# Career Pathway Reflection (Text-Only)

A six-prompt, text-first reflection tool that gives quick AI follow-ups and rubric-based feedback on clarity, specificity, and alignment to your goals. Uses Next.js 16, ElevenLabs UI conversation components for the transcript, LLM scoring (Anthropic/OpenAI), and Supabase persistence (separate tables from the voice app).

## Setup
1) Install deps
   ```bash
   npm install
   ```

2) Env vars — copy `.env.example` to `.env.local` and fill:
   - `DEFAULT_MODEL_PROVIDER` (anthropic|openai)
   - `OPENAI_API_KEY`, `OPENAI_MODEL` (if using OpenAI)
   - `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` (if using Anthropic)
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (required to persist sessions/scores)
   - ElevenLabs keys optional (kept for future voice features)

3) Create reflection tables (kept separate from the voice interview app)
   - Run `supabase/migrations/20250314_create_reflection_tables.sql` in the Supabase SQL editor, or via psql.

4) Run dev server
   ```bash
   npm run dev
   ```
   Then open http://localhost:3000 (the flow is at `/interview`).

## What’s inside
- `src/app/page.tsx` — landing/setup form, now branded for “Career Pathway Reflection”.
- `src/app/interview/page.tsx` — main flow (prep → write → score) using text input and ElevenLabs conversation UI for transcript display.
- `src/app/api/score/route.ts` — LLM scoring endpoint writing to `reflection_sessions` / `reflection_scores` tables.
- `src/lib/flow-config.ts` — six prompts with agent IDs kept for reference.
- `src/lib/rubric.ts` — rubric schema, prompt, and parsing.
- `supabase/migrations/20250314_create_reflection_tables.sql` — DDL for isolated reflection tables.

## Notes
- CSV export is named `reflection-report.csv`.
- Build/lint: `npm run lint` (passes; one existing Codacy lint warning), `npm run build` tested OK.
- Supabase tables are separated from any voice/“mock interview” data to avoid mixing records.
