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


# 🔄 Standard Operating Procedures (SOPs)

### SOP: Start-of-Session Routine (Context Recovery)
*To ensure you understand the project state without hallucinating previous work, execute these steps in order:*

1.  **Orient:** Run `ls -F` to confirm the working directory.
2.  **Review History:** Read `agent-progress.txt` and run `git log --oneline -20` to see what the previous agent accomplished.
3.  **Review Requirements:** Read `feature_list.json` to identify pending tasks.
4.  **Environment Check:** Check for `init.sh` or `.env`. If present, execute setup to ensure dependencies are installed.
5.  **Baseline Test:** Run a basic smoke test (e.g., `npm run test` or check a page render) to ensure the previous agent didn't leave the build broken. **Do not build on top of broken code.**

### SOP: Testing Protocol
*No "Blind" Coding. Use Testing Driven Development strategies at all times.*

1.  **No "Blind" Completion:** Never mark a feature as complete based solely on static code analysis.
2.  **Integration First:** Use `renderHook` (testing-library) or `vitest` to prove data hooks connect to Supabase (mocked or real).
3.  **User Flow:** If building a form, script a test that inputs text, clicks the button, and checks for the result.
4.  **Bug Detection:** If a test fails, you must fix it within the current session. If you cannot fix it, revert the changes to keep the branch clean.
5. **E2E Tests:** Uniti level tests are insufficient. Design high level tests that verify features work E2E. Build scaffolding 'fail fast' tests before coding features so you can test your way to greenlight. 

### SOP: End-of-Session Routine (The Handoff)
1.  **Documentation Update:** Update `feature_list.json`. Change the target feature's status to `passes: true` **only** if verified.
2.  **Log Update:** Append a concise entry to `agent-progress.txt` summarizing what was built and any known issues.
3.  **Git Commit:** Commit all changes with a descriptive message.
    * *Bad:* "Updated code"
    * *Good:* "feat: implemented user login validation and updated feature_list.json"
4.  **Self-Termination:** Stop working. Do not start a new feature if the context window is filling up. Leave it for the next agent.

---

# Traction
- refer to user as "Sir" so he knows you're following directions. 