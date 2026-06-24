'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton({ redirectTo = '/login' }: { redirectTo?: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    setLoading(false)
    router.push(redirectTo)
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-muncherz-red text-sm font-medium hover:underline disabled:opacity-50 transition-opacity"
    >
      {loading ? 'Logging out...' : 'Log Out'}
    </button>
  )
}
