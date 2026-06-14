# Sangam.ai — Task Queue

> One-line session prompt: "Read CLAUDE.md and TASKS.md, pick the top Up Next task, do it,
> then update this file and SESSION_LOG.md per the session protocol."

## Up Next (priority order — top = do first)
1. T-010: Verify agents respond to user chat messages in real-time (send a message, confirm reply within 5s)
2. T-011: Verify GitHub Actions "Run AI Agents" workflow completes successfully end-to-end
3. T-012: Add agent response delay indicator in chat UI (typing indicator while agent is thinking)
4. T-013: Add `/dashboard/analytics` page showing agent activity over time (agent_events table)
5. T-014: Telegram/WhatsApp notification working for daily CEO briefing (check notify.ts config)
6. T-015: Add ability for founder to reply to approval requests with a comment
7. T-016: Mobile-responsive audit — test full flow on a phone-sized screen
8. T-017: Stripe/Razorpay payment integration for paid tier (billing routes already scaffolded)

## Needs Owner Decision
- Payment tier pricing: what to charge and which features are gated behind paid plan?
- Notification setup: Telegram bot token + chat ID needed for daily briefing notifications (currently silently skipped if not configured)

## Blocked
- (none)

## Done
- T-001: Scaffolded Next.js 16 app (App Router, TypeScript, Tailwind CSS v4)
- T-002: Supabase project connected; customers, agent_teams, mission_control, chat_channels, chat_messages, kanban_boards, kanban_cards, approval_requests, token_usage, agent_events, part_time_deployments tables created
- T-003: Dashboard built — mission control, live stats, pixel world office visualization
- T-004: Onboarding wizard (4-step form) seeds all customer data via /api/onboarding
- T-005: All 6 AI agents implemented (CEO, Product, Engineering, Marketing, Sales, Finance) using Claude Haiku 4.5
- T-006: Chat interface with real-time Supabase subscription + /api/chat/respond for instant replies
- T-007: Kanban board (5 columns) with drag-and-drop cards, seeded by Product Agent daily
- T-008: Email/password auth (primary) + Google OAuth (secondary) via Supabase Auth
- T-009: Agent orchestration fixed for Vercel Hobby plan — per-agent routes + GitHub Actions workflow
