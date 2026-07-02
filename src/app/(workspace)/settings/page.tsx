import { createClient } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'

export const metadata = { title: 'Config — Apex Workspace' }
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const envFlags = {
    supabase:  !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    github:    !!process.env.GITHUB_TOKEN,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    meta:      !!process.env.META_ACCESS_TOKEN,
    gmail:     !!process.env.GOOGLE_REFRESH_TOKEN,
    gcal:      !!process.env.GOOGLE_CLIENT_ID,
    hunter:    !!process.env.HUNTER_API_KEY,
  }

  let customIntegrations: {
    id: string; name: string; env_var: string
    category: string; mapped_tool: string; notes: string | null
  }[] = []

  try {
    const { data } = await supabase
      .from('custom_integrations')
      .select('*')
      .order('created_at', { ascending: true })
    if (data) customIntegrations = data
  } catch {
    // Table not yet created — silently degrade
  }

  return (
    <SettingsClient
      user={{ email: user?.email }}
      envFlags={envFlags}
      customIntegrations={customIntegrations}
    />
  )
}
