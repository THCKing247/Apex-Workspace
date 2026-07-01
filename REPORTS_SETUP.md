# Reports System Setup

## Step 1 — Run this SQL in Supabase SQL editor

```sql
create table reports (
  id            uuid default gen_random_uuid() primary key,
  type          text not null check (type in (
                  'pipeline_health','braik_outreach','territory_coverage',
                  'social_performance','api_intelligence','agent_performance'
                )),
  cadence       text default 'on_demand' check (cadence in ('weekly','monthly','on_demand')),
  status        text default 'pending' check (status in ('pending','generating','ready','error')),
  generated_at  timestamp with time zone default now(),
  period_start  date,
  period_end    date,
  data          jsonb,
  narrative     text,
  error         text,
  created_at    timestamp with time zone default now()
);

-- Agent runs table (empty now, ready for when agents are deployed)
create table agent_runs (
  id            uuid default gen_random_uuid() primary key,
  agent_id      text not null,
  agent_name    text not null,
  type          text check (type in ('outreach','enrichment','content','research')),
  brand         text check (brand in ('buildvance','braik','apex')),
  success       boolean default true,
  tokens_used   int default 0,
  cost_usd      numeric(8,4) default 0,
  outcome_label text,
  ran_at        timestamp with time zone default now()
);

alter table reports    enable row level security;
alter table agent_runs enable row level security;

create policy "auth full access" on reports    for all using (auth.role() = 'authenticated');
create policy "auth full access" on agent_runs for all using (auth.role() = 'authenticated');

-- Index for fast per-type lookups
create index reports_type_idx on reports(type, generated_at desc);
```

## Step 2 — Install PDF export dependencies

```bash
npm install html2canvas jspdf
npm install --save-dev @types/jspdf
```

## Step 3 — Add Reports to Sidebar

In `src/components/Sidebar.tsx`, add to the TODAY section:

```ts
{ label: 'Reports', href: '/reports', icon: FileBarChart2, brand: 'apex' },
```

And add the import:
```ts
import { FileBarChart2 } from 'lucide-react'
```

## Step 4 — Scheduled reports via Supabase Edge Functions (optional, for auto-generation)

Create a Supabase Edge Function at `supabase/functions/weekly-reports/index.ts`:

```ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async () => {
  const types = ['pipeline_health','braik_outreach','territory_coverage','social_performance','api_intelligence','agent_performance']
  
  await Promise.allSettled(types.map(type =>
    fetch(`${Deno.env.get('NEXT_PUBLIC_APP_URL')}/api/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` },
      body: JSON.stringify({ type, cadence: 'weekly' }),
    })
  ))
  
  return new Response('Reports generated', { status: 200 })
})
```

Then in Supabase dashboard → Edge Functions → Schedule this function to run every Monday at 7am:
`0 7 * * 1`

## Cursor prompt to add Reports nav item

```
In /src/components/Sidebar.tsx, add a Reports nav item to the TODAY section.
Import FileBarChart2 from lucide-react.
Add this item after Action Needed:
{ label: 'Reports', href: '/reports', icon: FileBarChart2, brand: 'apex' }
```
