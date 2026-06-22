import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProfileState {
  preferredLanguage: 'en' | 'ur'
  setLanguage: (lang: 'en' | 'ur') => void
  isRTL: boolean
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      preferredLanguage: 'en',
      setLanguage: (lang) => set({ preferredLanguage: lang, isRTL: lang === 'ur' }),
      isRTL: false,
    }),
    {
      name: 'profile-storage',
    }
  )
)
