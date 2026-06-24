'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function AccountSection() {
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    try {
      await fetch('/api/profile/delete', { method: 'POST' })
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <section className="pt-6">
      {showConfirm ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="mb-3 flex items-start gap-2 text-red-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">This will permanently delete your account and all data. This action cannot be undone.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDelete} className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-bold text-white hover:bg-red-700">
              Confirm Delete
            </button>
            <button onClick={() => setShowConfirm(false)} className="flex-1 rounded-lg bg-white py-2 text-sm font-bold text-gray-700 border hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setShowConfirm(true)}
          className="flex w-full items-center justify-center gap-2 py-4 text-sm font-bold text-muncherz-red hover:underline"
        >
          <Trash2 className="h-4 w-4" /> Delete Account
        </button>
      )}
    </section>
  )
}
