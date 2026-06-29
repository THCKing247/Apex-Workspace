# Apex Workspace

Internal business HQ for **Apex Technical Solutions Group** — dashboard, pipeline, projects, inbox, social, and AI assistant in one place.

Built for Michael (CTO) and Kenny (COO). Invite-only access.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Database & Auth | Supabase (your project) |
| Hosting | Netlify |
| Styling | Tailwind CSS |

Optional integrations (GitHub, Meta, Gmail, Hunter, Anthropic) activate only when you add their API keys to environment variables.

## Getting Started

1. Create a Supabase project and add keys to `.env.local`
2. Run the SQL schema in `DEPLOYMENT.md`
3. Invite users in Supabase → Authentication

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the Apex Workspace login, then the dashboard.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Netlify setup, Supabase schema, and custom domain (`workspace.apextsgroup.com`).
