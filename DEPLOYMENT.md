# Deploy to Vercel

## Local Development Setup (New Supabase Project)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Once created, go to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret)
3. Paste those into `.env.local` in this project
4. Go to **SQL Editor** and run the schema SQL below (under "Run Supabase Schema")
5. Go to **Authentication → Users → Invite User** to create Michael and Kenny's accounts
6. For local dev, go to **Authentication → URL Configuration** and add:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: `http://localhost:3000/auth/callback`
7. Run `npm run dev` and sign in at `/login`

## Prerequisites

- GitHub repo: push this codebase to `github.com/your-username/apex-workspace`
- Supabase project created at [supabase.com](https://supabase.com) (free tier)
- All environment variables from `.env.local` ready

## Steps

1. Go to [vercel.com](https://vercel.com) → **New Project** → **Import from GitHub**
2. Select the `apex-workspace` repository
3. In **Environment Variables**, add every value from `.env.local`
4. Click **Deploy**

## After Deployment

### Configure Supabase Auth URLs

Go to **Supabase → Authentication → URL Configuration** and set:

- **Site URL**: `https://apex-workspace.vercel.app`
- **Redirect URLs**: `https://apex-workspace.vercel.app/auth/callback`

### Create User Accounts

Go to **Supabase → Authentication → Users → Invite User**

Invite yourself (Michael) and Kenny — you'll each get an email to set a password.
No public sign-up is available (intentional).

### Run Supabase Schema

In the **Supabase SQL Editor**, run this SQL to create the required tables:

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

## Environment Variables Reference

| Variable | Where to Get It |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `GITHUB_TOKEN` | GitHub → Settings → Developer Settings → Personal Access Tokens |
| `META_ACCESS_TOKEN` | Meta Business Suite → Business Settings → System Users → Generate Token |
| `META_PAGE_ID_APEX` | Apex TSG Facebook Page → About → Page ID |
| `META_PAGE_ID_BUILDVANCE` | Buildvance Facebook Page → About → Page ID |
| `META_PAGE_ID_BRAIK` | Braik Facebook Page → About → Page ID |
| `HUNTER_API_KEY` | hunter.io → Dashboard → API Key |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `GOOGLE_CLIENT_ID` | console.cloud.google.com → Credentials → OAuth 2.0 Client |
| `GOOGLE_CLIENT_SECRET` | Same as above |
| `GOOGLE_REFRESH_TOKEN` | developers.google.com/oauthplayground → Gmail API v1 → exchange code |

## Custom Domain (apextsgroup.com)

After deploying to Vercel:

1. **Vercel** → Project → **Settings → Domains**
2. Add `workspace.apextsgroup.com` (recommended subdomain) or `apextsgroup.com`
3. At your domain registrar (where apextsgroup.com is managed), add the DNS record Vercel shows:
   - Subdomain: `CNAME` → `workspace` → `cname.vercel-dns.com`
   - Root domain: follow Vercel’s A/CNAME instructions for apex domains
4. Wait for DNS propagation (often 5–30 minutes)
5. Update **Supabase → Authentication → URL Configuration**:
   - **Site URL**: `https://workspace.apextsgroup.com`
   - **Redirect URLs**: `https://workspace.apextsgroup.com/auth/callback`
