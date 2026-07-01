import { createClient } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'

export const metadata = { title: 'Config — Apex Workspace' }
export const dynamic = 'force-dynamic'

type AccentColor = 'apex' | 'buildvance' | 'braik'

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

  let sidebarItems: {
    nav_key: string
    label: string
    sort_order: number
    visible: boolean
    accent_color: AccentColor
  }[] = []

  try {
    const { data } = await supabase
      .from('sidebar_config')
      .select('nav_key, label, sort_order, visible, accent_color')
      .order('sort_order', { ascending: true })
    if (data) sidebarItems = data as typeof sidebarItems
  } catch {
    // Table not yet created — silently degrade
  }

  return (
    <SettingsClient
      user={{ email: user?.email }}
      envFlags={envFlags}
      sidebarItems={sidebarItems}
    />
  )
}
