# Roadmap: Career Pathway Reflection (Text)

## Goal
Build a lightweight text-first reflection experience that walks a user through six career pathway prompts, lets them interact with a concise ElevenLabs conversational coach, and surfaces a clean transcript of every response. Scoring/evaluation and Supabase persistence were removed to keep the flow simple and focused on writing.

## Stack & Libraries
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui primitives.
- **Conversation coach:** ElevenLabs ConvAI text endpoint for the live prompt follow-ups; agents are configured in the ElevenLabs dashboard.
- **Testing/docs:** Static assets (logos, mockups) live under `public/`, `assets/`, or `UI-Mockups/`. There are no automated tests for this flow yet.

## Flow
1. `flow-config` defines the intro plus six live-answer steps (agent IDs kept for reference).
2. `app/interview/page.tsx` renders the nav/controls, calls `StepRenderer`, and keeps transcript state in-memory.
3. `StepRenderer` manages the start/send controls and surface-level transcript, while `Transcript` renders the message list.
4. `LeftNav` shows progress and lets users revisit earlier prompts without nested tabs.
5. `app/api/coach/route.ts` relays user input to ElevenLabs in order to generate new AI guidance (no scoring).

## Project Structure
- `src/app/interview/page.tsx` — main flow (intro + six prompt screens) plus layout chrome.
- `src/components/interview/StepRenderer.tsx` — text entry, conversation control, and transcript toggle.
- `src/components/interview/Transcript.tsx` — ElevenLabs Conversation UI for the chat history.
- `src/components/layout/LeftNav.tsx` — flat navigation/progress column.
- `src/lib/flow-config.ts` — prompt metadata and agent IDs.
- `src/app/api/coach/route.ts` — the server-side proxy that hits ElevenLabs and returns its reply.

## Key Steps to Work on
1. Keep `flow-config` synchronized with the six prompts and agent IDs you want to keep in rotation.
2. Make sure `StepRenderer` resets the transcript whenever the user starts a new response or clears history.
3. Use `LeftNav` for navigation state so the UI stays predictable despite the one-question-at-a-time flow.
4. If you need new prompts or follow-up phrasing, update `app/api/coach/route.ts` markup or agent configuration in ElevenLabs.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Provide an ElevenLabs API key:
   - Copy `.env.example` to `.env.local` and set `ELEVENLABS_API_KEY`.
   - You only need the key if you want the live AI follow-ups; the rest of the app is static text.
3. Start the dev server:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 and head to `/interview` to see the flow.
