# Deploy Apex Workspace (Netlify)

## Local Development

1. Create a project at [supabase.com](https://supabase.com) → **New Project**
2. **Settings → API** — copy into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional; keep secret)
3. **SQL Editor** — run the schema SQL below
4. **Authentication → Users → Invite User** — invite Michael and Kenny
5. **Authentication → URL Configuration** (local):
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: `http://localhost:3000/auth/callback`
6. Run `npm install` then `npm run dev`

## Netlify Deployment

Netlify is connected to GitHub (`THCKing247/Apex-Workspace`).

1. **Netlify** → **Add new site** → import **Apex-Workspace**
2. Build settings (auto-detected via `netlify.toml`):
   - **Build command:** `npm run build`
   - Uses **@netlify/plugin-nextjs**
3. **Site settings → Environment variables** — add every value from `.env.local`
4. Deploy

## After Netlify Deploy

### Supabase Auth URLs

**Authentication → URL Configuration**:

- **Site URL**: your Netlify URL (e.g. `https://apex-workspace.netlify.app`) or `https://workspace.apextsgroup.com`
- **Redirect URLs**: same base + `/auth/callback`

### Create User Accounts

**Authentication → Users → Invite User** — invite-only, no public sign-up.

## Supabase Schema

Run in **SQL Editor**:

```sql
-- Leads table
create table leads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  company text,
  email text,
  status text default 'open' check (status in ('open','contacted','proposal','closed')),
  source text,
  notes text,
  created_at timestamp with time zone default now()
);

-- Projects table
create table projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  client text,
  status text default 'active' check (status in ('active','paused','completed')),
  github_repo text,
  last_updated timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table leads enable row level security;
alter table projects enable row level security;

-- Allow authenticated users full access
create policy "Auth users can do everything on leads"
  on leads for all using (auth.role() = 'authenticated');

create policy "Auth users can do everything on projects"
  on projects for all using (auth.role() = 'authenticated');
```

## Custom Domain (workspace.apextsgroup.com)

1. **Netlify** → Site → **Domain management** → add `workspace.apextsgroup.com`
2. At your DNS provider, add the record Netlify shows (usually CNAME `workspace` → your Netlify subdomain)
3. Update Supabase auth URLs to `https://workspace.apextsgroup.com` and `/auth/callback`

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Database + auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client access |
| `GITHUB_TOKEN` | No | Projects GitHub sync |
| `META_ACCESS_TOKEN` | No | Social page |
| `META_PAGE_ID_*` | No | Social page |
| `HUNTER_API_KEY` | No | Pipeline prospecting |
| `ANTHROPIC_API_KEY` | No | AI Assistant |
| `GOOGLE_*` | No | Inbox |

Only Supabase is required to run the core app. All other integrations are optional — add env vars when you want them.
