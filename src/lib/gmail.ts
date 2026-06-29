/*
 * To get GOOGLE_REFRESH_TOKEN:
 * 1. Go to https://developers.google.com/oauthplayground
 * 2. In the top-right gear icon, check "Use your own OAuth credentials" and enter your GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
 * 3. In the left panel, find "Gmail API v1" and select https://www.googleapis.com/auth/gmail.readonly
 * 4. Click "Authorize APIs", sign in, then click "Exchange authorization code for tokens"
 * 5. Copy the "Refresh token" value to GOOGLE_REFRESH_TOKEN in .env.local
 */

async function getAccessToken(): Promise<string | null> {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    return null
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) return null
  const data = await res.json()
  return data.access_token ?? null
}

export interface GmailMessage {
  id: string
  from: string
  subject: string
  snippet: string
  date: string
  isUnread: boolean
}

export async function listMessages(query = 'is:unread'): Promise<GmailMessage[]> {
  const token = await getAccessToken()
  if (!token) return []

  const listRes = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=20`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!listRes.ok) return []
  const listData = await listRes.json()
  const ids: string[] = (listData.messages ?? []).map((m: { id: string }) => m.id)

  const messages = await Promise.all(ids.map((id) => getMessage(id, token)))
  return messages.filter(Boolean) as GmailMessage[]
}

async function getMessage(id: string, token: string): Promise<GmailMessage | null> {
  const res = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!res.ok) return null
  const data = await res.json()

  const headers: { name: string; value: string }[] = data.payload?.headers ?? []
  const get = (name: string) => headers.find((h) => h.name === name)?.value ?? ''

  return {
    id: data.id,
    from: get('From'),
    subject: get('Subject'),
    snippet: data.snippet ?? '',
    date: get('Date'),
    isUnread: (data.labelIds ?? []).includes('UNREAD'),
  }
}
