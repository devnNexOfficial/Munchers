'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { RestaurantSettings } from '@/lib/queries/home'
import { useRestaurantStatus } from '@/context/RestaurantStatusContext'

export function ClosedOverlay({ initialSettings }: { initialSettings: RestaurantSettings | null }) {
  const { isRestaurantClosed, setIsRestaurantClosed } = useRestaurantStatus()
  
  // We need local state for the overlay to ensure hydration matches server initially
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState<RestaurantSettings | null>(initialSettings)

  // Logic to determine if closed based on settings and time
  const checkIsClosed = (currentSettings: RestaurantSettings | null) => {
    if (!currentSettings) return false
    if (currentSettings.is_manually_closed) return true
    
    // Check time if open_time and close_time exist
    if (currentSettings.open_time && currentSettings.close_time) {
      const now = new Date()
      // Create date objects for today with the open/close times
      const openTime = new Date()
      const [openH, openM] = currentSettings.open_time.split(':').map(Number)
      openTime.setHours(openH, openM, 0, 0)
      
      const closeTime = new Date()
      const [closeH, closeM] = currentSettings.close_time.split(':').map(Number)
      closeTime.setHours(closeH, closeM, 0, 0)
      
      // Handle cases where close time is after midnight
      if (closeTime < openTime) {
        if (now >= openTime || now < closeTime) {
          return false // Open
        }
      } else {
        if (now >= openTime && now < closeTime) {
          return false // Open
        }
      }
      return true // Closed
    }
    
    return false
  }

  useEffect(() => {
    setMounted(true)
    
    // Initial check
    const initiallyClosed = checkIsClosed(settings)
    setIsRestaurantClosed(initiallyClosed)
    
    // Subscribe to realtime changes
    const supabase = createClient()
    const channel = supabase
      .channel('public:restaurant_settings')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'restaurant_settings' },
        (payload) => {
          const newSettings = payload.new as RestaurantSettings
          setSettings(newSettings)
          setIsRestaurantClosed(checkIsClosed(newSettings))
        }
      )
      .subscribe()
      
    // Re-check periodically in case time boundary is crossed
    const interval = setInterval(() => {
      setIsRestaurantClosed(checkIsClosed(settings))
    }, 60000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [settings, setIsRestaurantClosed])

  // Don't render anything on the server to avoid hydration mismatch,
  // or render if mounted
  if (!mounted) return null

  return (
    <AnimatePresence>
      {isRestaurantClosed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 pointer-events-none px-4 text-center"
        >
          {/* We wrap the content in a div that DOES capture pointer events so the user can't click things behind the message, 
              but the background allows scrolling/clicks if we set pointer-events-none on the container.
              Wait, the prompt says "pointer-events-none on overlay so browsing still works".
              So the whole overlay is pointer-events-none. */}
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full pointer-events-auto flex flex-col items-center">
            <div className="w-16 h-16 bg-muncherz-red rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4">
              M
            </div>
            <h2 className="text-2xl font-extrabold text-muncherz-black mb-2">
              We're Currently Closed
            </h2>
            <p className="text-gray-500 font-medium">
              {settings?.open_time ? `Opens at ${settings.open_time.substring(0, 5)}` : 'Check back later!'}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
