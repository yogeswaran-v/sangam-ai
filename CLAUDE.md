# Sangam.ai — Project Context

## What this is
Sangam.ai is a micro-SaaS giving solopreneurs an "autonomous AI agent team" via a mission
control dashboard. Six AI agents (CEO, Product, Engineering, Marketing, Sales, Finance)
run the founder's company autonomously — posting daily briefings, managing the kanban
board, and responding to messages in real-time.

## Owner constraints (read this every session)
- Owner has <5 hrs/week. Sessions are short and often from a tablet or phone.
- Owner prefers to DIRECT agents, not write code by hand.
- Budget for tools/compute: ~$20-50/month total. Avoid expensive services.
- Target market: start in India, design for global expansion later.
- Vercel Hobby plan: 10s function timeout limit — never set maxDuration > 10 in route files.

## Stack
- Frontend/Backend: Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- DB/Auth: Supabase (email/password + Google OAuth, RLS enabled)
- Agent model: Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) via Anthropic SDK
- Session refresh: `src/proxy.ts` (NOT middleware.ts — do not create middleware.ts)
- Cron: GitHub Actions `.github/workflows/orchestrate.yml` (daily 9 AM UTC + manual dispatch)
- Each agent has its own route: `/api/cron/agents/[agent]` (fits Hobby 10s limit)

## Key files
- `src/lib/orchestrator/orchestrator.ts` — `runSingleAgent()`, `runOrchestrationCycle()`
- `src/lib/orchestrator/agents/` — CeoAgent, ProductAgent, EngineeringAgent, MarketingAgent, SalesAgent, FinanceAgent
- `src/lib/supabase/admin.ts` — `supabaseAdmin` (service role, bypasses RLS)
- `src/app/api/chat/respond/route.ts` — real-time agent replies to user messages
- `src/app/api/cron/agents/[agent]/route.ts` — per-agent cron endpoint
- `src/components/chat/ChatInterface.tsx` — chat UI with realtime subscription
- `src/components/pixel-world/PixelWorld.tsx` — animated office visualization

## Repo conventions
- Keep PRs/commits small and self-contained (reviewable from a phone).
- Every commit message should start with the task area, e.g. "Fix CEO agent timeout"
- Don't introduce new dependencies/services without flagging it in TASKS.md first.
- Always use `supabaseAdmin` (not user client) when inserting agent-generated content.
- Run `npx tsc --noEmit` before pushing to catch type errors early.

## Session protocol (Claude: follow this every time)
1. Read this file (CLAUDE.md) and TASKS.md.
2. Pick the top "Up Next" task from TASKS.md (unless owner specifies otherwise).
3. Do the work. Keep changes scoped to that task.
4. Update TASKS.md: move the task to "Done" with a one-line outcome note.
5. Append a short entry to SESSION_LOG.md: date, task, what changed, what's blocked, Up Next.
6. If something needs an owner decision (new service, cost, API key), add to "Needs Owner Decision" in TASKS.md.

## Current state (update each session — max 8 bullets)
- App is live at sangam-ai-pi.vercel.app — email/password auth + Google OAuth working.
- Onboarding wizard (4 steps) seeds customer, 6 chat channels, kanban board, and welcome message.
- Daily agent orchestration runs via GitHub Actions (9 AM UTC + manual dispatch from Actions tab).
- Each agent uses a single Claude Haiku call — CEO agent does briefing + approvals + specialists in one combined JSON call.
- Real-time chat: user messages trigger `/api/chat/respond` → agent replies via `supabaseAdmin` insert.
- Two GitHub secrets required: `CRON_SECRET` and `APP_URL` (see TASKS.md for setup instructions).
- `CRON_SECRET` must also be set in Vercel environment variables and a redeploy triggered after adding it.
- E2E test suite (93 tests) runs on every PR via GitHub Actions (Playwright).
