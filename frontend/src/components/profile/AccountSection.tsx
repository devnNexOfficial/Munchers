'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function AccountSection() {
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function handleDelete() {
    try {
      await fetch('/api/profile/delete', { method: 'POST' })
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
    } catch (e) {
      // Error handled by UI state
    }
  }

  return (
    <section className="relative pt-6">
      {/* Noise texture overlay */}
      <div className="noise-overlay absolute inset-0" />

      <div className="relative z-10 space-y-3">
        {showConfirm ? (
          <div className="rounded-wild-card bg-red-900/20 border border-red-700/50 p-4 backdrop-blur-sm">
            <div className="mb-3 flex items-start gap-2 text-red-300">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">This will permanently delete your account and all data. This action cannot be undone.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDelete} className="btn-primary flex-1 bg-red-700 hover:bg-red-600">
                Confirm Delete
              </button>
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1 border-wild-paper/30 text-wild-paper hover:bg-wild-paper/10">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={handleLogout}
              className="btn-secondary w-full"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="flex w-full items-center justify-center gap-2 py-4 text-sm font-bold text-wild-red hover:text-wild-red-light transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Delete Account
            </button>
          </>
        )}
      </div>
    </section>
  )
}
