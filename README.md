# Apex Workspace

Internal business dashboard for **Apex Technical Solutions Group** — a custom software and web development company based in Tampa Bay, FL.

Built for Michael (CTO) and Kenny (COO) to track leads, projects, client communication, social analytics, and AI-assisted workflows from a single workspace.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Backend | Supabase (Postgres + Auth + RLS) |
| Styling | Tailwind CSS |
| Deployment | Vercel |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| Drag & Drop | @hello-pangea/dnd |
| Charts | Recharts |
| Icons | Lucide React |
| Toasts | Sonner |

## Features

- **Dashboard** — Business health overview: open leads, active projects, stat cards
- **Pipeline** — Kanban lead tracking (Open → Contacted → Proposal → Closed) with drag-and-drop
- **Prospecting** — Hunter.io domain search + email verification integrated into Pipeline
- **Projects** — Active project tracking with live GitHub data (issues, PRs, commits)
- **AI Assistant** — Claude-powered business assistant pre-loaded with Apex TSG context
- **Social** — Meta Graph API insights for Apex TSG, Buildvance, and Braik Facebook pages
- **Inbox** — Gmail integration with client thread filtering
- **Settings** — Integration status dashboard and account management

## Getting Started

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your API keys into `.env.local` (see `DEPLOYMENT.md`)
3. Run the SQL schema in Supabase SQL Editor (see `DEPLOYMENT.md`)
4. Invite users in Supabase → Authentication → Users

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

Users are created manually in Supabase (no public sign-up).

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step Vercel deployment instructions, Supabase schema setup, and user account creation.
