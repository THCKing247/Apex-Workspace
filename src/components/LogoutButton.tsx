'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded transition-colors hover:bg-white/5"
      style={{ color: '#6b7280' }}
    >
      <LogOut size={13} />
      Sign out
    </button>
  )
}
