# Career Reflections (Text-Only)

Two parallel exercises with identical UI/UX:
- Acquisitions: `/acquisitions`
- Asset Management: `/asset-management`
- Development: `/development`
- Brokerage: `/brokerage`
- Lending: `/lending`

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` (or `.env`) and set:
   - `ELEVENLABS_API_KEY`
   - Supabase persistence: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - ElevenLabs agent IDs:
     - Acquisitions: `NEXT_PUBLIC_ACQUISITION_AGENT_ID` + `NEXT_PUBLIC_ACQUISITION_AGENT_2_ID` ... `_6_ID`
     - Asset Management: `NEXT_PUBLIC_ASSET_MANAGEMENT_AGENT_ID` + `NEXT_PUBLIC_ASSET_MANAGEMENT_AGENT_2_ID` ... `_6_ID`
     - Development: `NEXT_PUBLIC_DEVELOPMENT_AGENT_ID` + `NEXT_PUBLIC_DEVELOPMENT_AGENT_2_ID` ... `_6_ID`
     - Brokerage: `NEXT_PUBLIC_BROKERAGE_AGENT_ID` + `NEXT_PUBLIC_BROKERAGE_AGENT_2_ID` ... `_6_ID`
     - Lending: `NEXT_PUBLIC_LENDING_AGENT_ID` + `NEXT_PUBLIC_LENDING_AGENT_2_ID` ... `_6_ID`
3. Start the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 and visit `/acquisitions` or `/asset-management`.

> Scoring is not wired. Transcripts are saved on the Finish step.

## What's inside
- `src/app/(reflections)/[module]/page.tsx` — module entry gate (e.g. `/acquisitions`, `/asset-management`).
- `src/app/(reflections)/[module]/interview/page.tsx` — module reflection UI flow.
- `src/app/(reflections)/[module]/layout.tsx` — per-module metadata + validation.
- `src/components/interview/StepRenderer.tsx` — handles the start/end controls, textarea, and transcript toggle.
- `src/components/interview/Transcript.tsx` — renders the ElevenLabs Conversation UI with the transcript.
- `src/components/layout/LeftNav.tsx` — flat navigation showing progress through the six prompts.
- `src/lib/reflection/modules.ts` — module registry (titles, slugs, endpoints).
- `src/lib/reflection/flow-config.ts` — shared flow builder.
- `src/lib/reflection/question-key.ts` — shared question key helper.
- `src/app/api/acquisitions/coach/signed-url/route.ts` — signed URL for Acquisitions agents (bulkheaded).
- `src/app/api/asset-management/coach/signed-url/route.ts` — signed URL for Asset Management agents (bulkheaded).
