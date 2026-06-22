'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FeedbackModalProps {
  orderId: string
  isOpen: boolean
  onClose: () => void
}

export function FeedbackModal({ orderId, isOpen, onClose }: FeedbackModalProps) {
  const [shouldShow, setShouldShow] = useState(false)
  const [overallRating, setOverallRating] = useState(0)
  const [foodRating, setFoodRating] = useState(0)
  const [riderRating, setRiderRating] = useState(0)
  const [comment, setComment] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const isSubmitted = localStorage.getItem(`feedback_submitted_${orderId}`)
      if (!isSubmitted) {
        setShouldShow(true)
      }
    } else {
      setShouldShow(false)
    }
  }, [isOpen, orderId])

  function handleSkip() {
    localStorage.setItem(`feedback_submitted_${orderId}`, 'true')
    setShouldShow(false)
    onClose()
  }

  async function handleSubmit() {
    if (overallRating === 0) return // Require at least overall rating
    setIsSubmitting(true)

    try {
      let photoUrl = null

      if (photo) {
        const supabase = createClient()
        const fileExt = photo.name.split('.').pop()
        const fileName = `${orderId}-${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('feedback-photos')
          .upload(filePath, photo)

        if (uploadError) {
          console.error('Photo upload failed:', uploadError)
        } else {
          // get public url or signed url here if needed, but per schema it's just path/url.
          photoUrl = filePath
        }
      }

      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          overall_rating: overallRating,
          food_rating: foodRating || null,
          rider_rating: riderRating || null,
          comment: comment || null,
          photo_url: photoUrl,
        }),
      })

      localStorage.setItem(`feedback_submitted_${orderId}`, 'true')
      setShouldShow(false)
      onClose()
    } catch (error) {
      console.error('Feedback submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  function renderStars(rating: number, setRating: (val: number) => void) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-8 w-8 ${
                star <= rating ? 'fill-muncherz-yellow text-muncherz-yellow' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <AnimatePresence>
      {shouldShow && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={handleSkip}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white p-6 shadow-xl sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:bottom-auto max-h-[90vh] overflow-y-auto"
          >
            <h2 className="mb-6 text-2xl font-black text-muncherz-black">How was your experience?</h2>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Overall Rating *</label>
                {renderStars(overallRating, setOverallRating)}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Food Quality (Optional)</label>
                {renderStars(foodRating, setFoodRating)}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Rider/Delivery (Optional)</label>
                {renderStars(riderRating, setRiderRating)}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Comments (Optional)</label>
                <textarea
                  maxLength={500}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you liked or how we can improve..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm focus:border-muncherz-red focus:outline-none focus:ring-1 focus:ring-muncherz-red"
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Add a Photo (Optional)</label>
                {photoPreview ? (
                  <div className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoPreview} alt="Preview" className="h-24 w-24 rounded-lg object-cover" />
                    <button
                      onClick={() => {
                        setPhoto(null)
                        setPhotoPreview(null)
                      }}
                      className="absolute -right-2 -top-2 rounded-full bg-red-100 p-1 text-muncherz-red"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                    <Upload className="mb-1 h-6 w-6 text-gray-400" />
                    <span className="text-xs text-gray-500">Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                )}
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={overallRating === 0 || isSubmitting}
                  className="w-full rounded-xl bg-muncherz-red py-3.5 font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
                <button
                  onClick={handleSkip}
                  className="w-full py-2 text-sm font-semibold text-gray-500 hover:text-gray-800"
                >
                  Skip
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
