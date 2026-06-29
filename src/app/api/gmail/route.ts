import { NextResponse } from 'next/server'
import { listMessages } from '@/lib/gmail'

export async function GET() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    return NextResponse.json({ error: 'Gmail not configured', messages: [] }, { status: 200 })
  }

  try {
    const messages = await listMessages('is:unread')
    return NextResponse.json({ messages })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch Gmail', messages: [] }, { status: 200 })
  }
}
