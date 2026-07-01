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
      className="flex items-center gap-1.5 px-2 py-1.5 rounded transition-colors hover:bg-red-500/10 uppercase tracking-widest"
      style={{ fontFamily: 'var(--font-teko)', fontSize: '0.85rem', color: '#ef4444', letterSpacing: '0.05em' }}
    >
      <LogOut size={13} />
      Sign out
    </button>
  )
}
