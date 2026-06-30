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
    <section className="relative rounded-wild-card bg-wild-brown border border-wild-rust p-6 shadow-wild-ember overflow-hidden">
      {/* Noise texture overlay */}
      <div className="noise-overlay absolute inset-0" />

      <div className="relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-wild-red text-2xl font-bold text-wild-paper shadow-wild-glow">
            {profile.name ? profile.name.charAt(0).toUpperCase() : '👤'}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="wild-input w-full"
                  autoFocus
                />
                <button onClick={handleSaveName} className="btn-secondary text-xs">Save</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-black text-wild-paper">{profile.name || 'Set your name'}</h2>
                <button onClick={() => setIsEditing(true)} className="text-wild-paper/60 hover:text-wild-red transition-colors">
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            )}
            <p className="font-body text-sm text-wild-paper/60">{profile.phone}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-wild-charcoal/50 pt-4">
          <div className="flex items-center gap-2">
            <span className="section-label text-wild-paper/90">Language</span>
            <div className="flex items-center rounded-wild-pill bg-wild-black-light p-1">
              <button
                onClick={() => setLang('en')}
                className={`rounded-wild-pill px-3 py-1 text-xs font-bold transition-all ${lang === 'en' ? 'bg-wild-red text-wild-paper shadow-wild-ember' : 'text-wild-paper/60 hover:text-wild-paper'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ur')}
                className={`rounded-wild-pill px-3 py-1 text-xs font-bold transition-all ${lang === 'ur' ? 'bg-wild-red text-wild-paper shadow-wild-ember' : 'text-wild-paper/60 hover:text-wild-paper'}`}
              >
                اردو
              </button>
            </div>
          </div>
          <LogoutButton redirectTo="/" />
        </div>
      </div>
    </section>
  )
}
