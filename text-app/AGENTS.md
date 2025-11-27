# Repository Guidelines

## Project Structure & Module Organization
- Next.js App Router lives in `src/app`; `interview/page.tsx` is the main flow and `api/score/route.ts` handles LLM scoring + Supabase writes. `page.tsx` is the landing gate.
- Shared UI in `src/components` (`interview`, `layout`, `ui`), business logic in `src/lib` (`flow-config`, `rubric`, `supabase`), and shared types in `src/types`.
- Static assets sit in `public/` (runtime) and `assets/` or `UI-Mockups/` (design references).
- Path alias `@/*` maps to `src/*`; favor it over deep relative imports.

## Build, Test, and Development Commands
- Install once: `npm install`.
- Develop: `npm run dev` (http://localhost:3000, interview flow at `/interview`).
- Production build: `npm run build`; serve locally with `npm start`.
- Lint: `npm run lint` (Next core-web-vitals + TypeScript rules).
- Tests are not yet wired; add a runner (e.g., vitest or jest) when introducing new logic.

## Coding Style & Naming Conventions
- TypeScript is `strict`; type props and function returns. Prefer `async/await` and small pure helpers.
- Components are PascalCase (`LeftNav`), hooks/functions camelCase, environment keys SCREAMING_SNAKE_CASE.
- Use Tailwind utility classes; reuse primitives in `src/components/ui/` before adding new styles. Keep server/client boundaries explicit (`"use client"` when needed).
- Keep question flow data in config (`flow-config`) instead of hardcoding in components.

## Testing Guidelines
- Target priority areas: `lib/rubric` parsing/fallback, `/api/score` provider switching, and navigation/state in `interview/Page`.
- Place tests beside source files or under `src/__tests__`; name files `*.test.ts`/`*.test.tsx`.
- Mock Supabase and LLM clients; use fixtures for transcript messages and scoring responses. Track coverage for new modules even if global thresholds are unset.

## Commit & Pull Request Guidelines
- Follow current history: short, descriptive subjects in imperative/plain form (e.g., “Adjust scoring display to be per-question”). Keep one concern per commit.
- PRs should state what changed, why, and how to verify (include commands; add screenshots/GIFs for UI). Note any required env vars or migrations (see `roadmap.md` SQL).
- Link issues or TODOs in bodies when applicable; avoid bundling unrelated refactors with feature work.

## Environment & Secrets
- Local setup uses `.env.local` (see `.env.example`/`.env.local.example`). Required keys: `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` (and _2/_3/_4), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DEFAULT_MODEL_PROVIDER`, and model API keys (`OPENAI_*` or `ANTHROPIC_*`).
- Keep service-role and LLM keys server-side; only `NEXT_PUBLIC_*` values are safe for the client. Never commit `.env*` files. Store deploy secrets in your hosting provider (Netlify/Vercel) not in git.
