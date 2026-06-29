import { NextRequest } from 'next/server'

const SYSTEM_CONTEXT = `You are an internal AI assistant for Apex Technical Solutions Group (Apex TSG), a custom software and web development company based in Tampa Bay, FL. Co-founders are Michael (CTO) and Kenny (COO).

Current ventures:
- Braik.io: sports program management SaaS, football-first, targeting high school athletic directors and head coaches
- Buildvance: custom software for small businesses, trades-sector focus (plumbers, HVAC, contractors)
- Active client projects: Heather Thrifty Vintage (Next.js + Supabase vintage resale site), Menlo Atherton Glass Co. (Next.js redesign, premium Bay Area glass company)

You help with: drafting client proposals, writing outreach emails, brainstorming features, debugging strategy, summarizing meeting notes, writing social media posts for Apex/Buildvance/Braik, and anything else that helps run the business.

Be direct, practical, and entrepreneurial. Skip the preamble.`

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { messages } = await request.json()

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      stream: true,
      system: SYSTEM_CONTEXT,
      messages,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    return new Response(JSON.stringify({ error }), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
}
