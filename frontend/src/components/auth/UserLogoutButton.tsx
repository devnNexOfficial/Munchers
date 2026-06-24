'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function UserLogoutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    setLoading(true)
    // TODO: calls POST /api/auth/logout — backend Section 3
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
    router.push('/')
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
