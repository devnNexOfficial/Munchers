'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

import { useRestaurantStatus } from '@/context/RestaurantStatusContext'
import type { RestaurantSettings } from '@/lib/queries/home'
import { createClient } from '@/lib/supabase/client'

interface ClosedOverlayProps {
  initialSettings: RestaurantSettings | null
}

const logoPlaceholder =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" rx="16" fill="%23D62828"/%3E%3Cpath d="M17 45V19h7l8 12 8-12h7v26h-7V31L32 43 24 31v14z" fill="%23fff"/%3E%3C/svg%3E'

function isOutsideHours(settings: RestaurantSettings) {
  if (!settings.open_time || !settings.close_time) return false

  const now = new Date()
  const openTime = new Date(now)
  const closeTime = new Date(now)
  const [openHour, openMinute] = settings.open_time.split(':').map(Number)
  const [closeHour, closeMinute] = settings.close_time.split(':').map(Number)

  openTime.setHours(openHour, openMinute, 0, 0)
  closeTime.setHours(closeHour, closeMinute, 0, 0)

  if (closeTime <= openTime) {
    return now < openTime && now >= closeTime
  }

  return now < openTime || now >= closeTime
}

function isClosed(settings: RestaurantSettings | null) {
  if (!settings) return false
  return settings.is_manually_closed || isOutsideHours(settings)
}

export function ClosedOverlay({ initialSettings }: ClosedOverlayProps) {
  const { isRestaurantClosed, setIsRestaurantClosed } = useRestaurantStatus()
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState<RestaurantSettings | null>(initialSettings)

  useEffect(() => {
    setMounted(true)
    setIsRestaurantClosed(isClosed(settings))
  }, [settings, setIsRestaurantClosed])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('public:restaurant_settings')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'restaurant_settings' },
        (payload) => {
          setSettings(payload.new as RestaurantSettings)
        }
      )
      .subscribe()

    const intervalId = setInterval(() => {
      setIsRestaurantClosed(isClosed(settings))
    }, 60000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(intervalId)
    }
  }, [settings, setIsRestaurantClosed])

  if (!mounted) return null

  return (
    <AnimatePresence>
      {isRestaurantClosed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 px-4 text-center"
        >
          <div className="flex w-full max-w-sm flex-col items-center rounded-lg bg-white p-8 shadow-2xl">
            <Image
              src={logoPlaceholder}
              alt="Muncherz"
              width={64}
              height={64}
              unoptimized
              className="mb-4 h-16 w-16 rounded-2xl"
            />
            <h2 className="mb-2 text-2xl font-extrabold text-muncherz-black">
              We&apos;re Currently Closed
            </h2>
            <p className="font-medium text-gray-500">
              {settings?.open_time
                ? `Opens at ${settings.open_time.substring(0, 5)}`
                : 'Check back later!'}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
