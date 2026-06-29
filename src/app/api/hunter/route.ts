import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const apiKey = process.env.HUNTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'HUNTER_API_KEY not configured' }, { status: 200 })
  }

  const { searchParams } = new URL(request.url)
  const domain = searchParams.get('domain')
  const email = searchParams.get('email')
  const action = searchParams.get('action') ?? 'domain'

  try {
    if (action === 'verify' && email) {
      const res = await fetch(
        `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${apiKey}`
      )
      const data = await res.json()
      return NextResponse.json(data)
    }

    if (domain) {
      const res = await fetch(
        `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${apiKey}`
      )
      const data = await res.json()
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Missing domain or email parameter' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Hunter API request failed' }, { status: 500 })
  }
}
