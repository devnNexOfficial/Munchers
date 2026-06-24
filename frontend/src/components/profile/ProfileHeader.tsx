'use client'

import { useState } from 'react'
import { Edit2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LogoutButton } from '@/components/auth/LogoutButton'

type Profile = { id: string; name: string | null; phone: string; language: string; loyalty_stamps: number }

export function ProfileHeader({ profile, lang, setLang }: { profile: Profile; lang: 'en' | 'ur'; setLang: (l: 'en' | 'ur') => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(profile.name || '')
  
  async function handleSaveName() {
    setIsEditing(false)
    if (name === profile.name) return
    const supabase = createClient()
    await supabase.from('profiles').update({ name }).eq('id', profile.id)
    profile.name = name
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muncherz-red text-2xl font-bold text-white">
          {profile.name ? profile.name.charAt(0).toUpperCase() : '👤'}
        </div>
        <div className="flex-1">
          {isEditing ? (
            <div className="flex gap-2">
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full rounded border px-2 py-1 text-sm outline-none focus:border-muncherz-red" 
                autoFocus
              />
              <button onClick={handleSaveName} className="text-sm font-bold text-muncherz-red">Save</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-muncherz-black">{profile.name || 'Set your name'}</h2>
              <button onClick={() => setIsEditing(true)}><Edit2 className="h-4 w-4 text-gray-400" /></button>
            </div>
          )}
          <p className="text-sm text-gray-500">{profile.phone}</p>
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">Language</span>
          <div className="flex items-center rounded-full bg-gray-100 p-1">
            <button 
              onClick={() => setLang('en')}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${lang === 'en' ? 'bg-white shadow-sm text-muncherz-red' : 'text-gray-500'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('ur')}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${lang === 'ur' ? 'bg-white shadow-sm text-muncherz-red' : 'text-gray-500'}`}
            >
              اردو
            </button>
          </div>
        </div>
        <LogoutButton redirectTo="/" />
      </div>
    </section>
  )
}
