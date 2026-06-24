/**
 * STORE: useProfileStore
 * PURPOSE:   Persists the user's UI language preference across sessions.
 *            Also derives isRTL to avoid scattered `lang === 'ur'` checks.
 * DEPENDENCIES: Zustand persist middleware (localStorage)
 * SIDE EFFECTS: Writes to localStorage under the key 'profile-storage'.
 * PERFORMANCE: Persisted stores hydrate synchronously on first render.
 *              isRTL is derived during the setLanguage action — no useMemo needed.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProfileState {
  /** The user's selected UI language ('en' for English, 'ur' for Urdu) */
  preferredLanguage: 'en' | 'ur'

  /**
   * Updates the preferred language and derives the RTL flag.
   *
   * @param lang - 'en' or 'ur'
   */
  setLanguage: (lang: 'en' | 'ur') => void

  /**
   * True when preferredLanguage is 'ur' — Urdu is right-to-left.
   * Derived during setLanguage; components can read this directly instead
   * of checking `preferredLanguage === 'ur'` inline.
   */
  isRTL: boolean
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      preferredLanguage: 'en',
      isRTL: false,

      setLanguage: (lang) =>
        set({
          preferredLanguage: lang,
          // isRTL is derived here rather than computed in every component
          isRTL: lang === 'ur',
        }),
    }),
    {
      name: 'profile-storage', // localStorage key
    }
  )
)
