/**
 * Shared Google OAuth2 refresh-token flow.
 * Used by both Calendar and Gmail integrations.
 *
 * To get GOOGLE_REFRESH_TOKEN:
 * 1. Go to https://developers.google.com/oauthplayground
 * 2. Click the gear icon -> check "Use your own OAuth credentials"
 * 3. Enter your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
 * 4. In scope box enter:
 *    https://www.googleapis.com/auth/calendar
 *    https://www.googleapis.com/auth/gmail.readonly
 * 5. Authorize -> Exchange auth code for tokens -> copy the refresh_token
 */
export async function getGoogleAccessToken(): Promise<string | null> {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) return null

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
  const { access_token } = await res.json()
  return access_token ?? null
}
