'use client'

import { useState, useEffect, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { createClient } from '@/lib/supabase/client'
import { feedbackSchema } from '@/lib/validators/feedback'

import { FeedbackActions } from './FeedbackActions'
import { FeedbackCommentField } from './FeedbackCommentField'
import { FeedbackPhotoUpload } from './FeedbackPhotoUpload'
import { FeedbackRatingSection } from './FeedbackRatingSection'

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
    if (overallRating === 0) return
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
          photoUrl = filePath
        }
      }

      const payload = {
        orderId,
        overallRating,
        foodRating: foodRating || undefined,
        riderRating: riderRating || undefined,
        comment: comment || undefined,
        photoUrl: photoUrl || undefined,
      }

      const parsed = feedbackSchema.safeParse(payload)
      if (!parsed.success) {
        alert('Invalid feedback data. Please try again.')
        setIsSubmitting(false)
        return
      }

      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: parsed.data.orderId,
          overall_rating: parsed.data.overallRating,
          food_rating: parsed.data.foodRating || null,
          rider_rating: parsed.data.riderRating || null,
          comment: parsed.data.comment || null,
          photo_url: parsed.data.photoUrl || null,
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

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
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
              <FeedbackRatingSection
                overallRating={overallRating}
                setOverallRating={setOverallRating}
                foodRating={foodRating}
                setFoodRating={setFoodRating}
                riderRating={riderRating}
                setRiderRating={setRiderRating}
              />
              <FeedbackCommentField comment={comment} onCommentChange={setComment} />
              <FeedbackPhotoUpload
                photoPreview={photoPreview}
                onPhotoChange={handlePhotoChange}
                onClearPhoto={() => {
                  setPhoto(null)
                  setPhotoPreview(null)
                }}
              />
              <FeedbackActions
                canSubmit={overallRating > 0}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onSkip={handleSkip}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

