# Career Pathway Reflection (Text-Only)

Six prompts, quick AI follow-ups, and a clean transcript for each written reflection. The experience is entirely text-based: you open `/interview`, start the response, and the ElevenLabs conversational coach replies with one-nudge guidance at a time.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and set `ELEVENLABS_API_KEY` (the backend route calls the ElevenLabs ConvAI chat endpoint).
3. Start the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 and visit `/interview`.

> There is no scoring loop or Supabase persistence anymore—just six text prompts and a guided chat transcript.

## What's inside
- `src/app/interview/page.tsx` — main landing+prompt layout with the left navigation panel.
- `src/components/interview/StepRenderer.tsx` — handles the start/end controls, textarea, and transcript toggle.
- `src/components/interview/Transcript.tsx` — renders the ElevenLabs Conversation UI with the transcript.
- `src/components/layout/LeftNav.tsx` — flat navigation showing progress through the six prompts.
- `src/lib/flow-config.ts` — prompt metadata plus optional agent IDs.
- `src/app/api/coach/signed-url/route.ts` — returns a signed WebSocket URL that the client uses to start the ElevenLabs conversation.
