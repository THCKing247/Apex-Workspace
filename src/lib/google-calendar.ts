import { getGoogleAccessToken } from './google-auth'

export interface GoogleEvent {
  id: string
  summary: string
  description?: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
}

export async function listGoogleEvents(timeMin: string, timeMax: string): Promise<GoogleEvent[]> {
  const token = await getGoogleAccessToken()
  if (!token) return []
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  })
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.items ?? []
}

export async function createGoogleEvent(event: {
  summary: string
  description?: string
  start: string
  end: string
}): Promise<string | null> {
  const token = await getGoogleAccessToken()
  if (!token) return null
  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start },
        end: { dateTime: event.end },
      }),
    }
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.id ?? null
}
