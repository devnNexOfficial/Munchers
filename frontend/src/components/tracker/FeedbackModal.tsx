'use client'

import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import Image from 'next/image'

import { AnimatePresence, motion } from 'framer-motion'
import { Star, X } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

interface FeedbackModalProps {
  orderId: string
  isOpen: boolean
  onClose: () => void
}

type RatingKind = 'overall' | 'food' | 'rider'

const ratingLabels: Record<RatingKind, string> = {
  overall: 'Overall',
  food: 'Food',
  rider: 'Rider',
}

function getStorageKey(orderId: string) {
  return `feedback_submitted_${orderId}`
}

function getPreviewUrl(file: File | null) {
  return file ? URL.createObjectURL(file) : null
}

export function FeedbackModal({ orderId, isOpen, onClose }: FeedbackModalProps) {
  const [overallRating, setOverallRating] = useState(0)
  const [foodRating, setFoodRating] = useState(0)
  const [riderRating, setRiderRating] = useState(0)
  const [comment, setComment] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [checkedStorage, setCheckedStorage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const previewUrl = useMemo(() => getPreviewUrl(photo), [photo])
  const visible = isOpen && checkedStorage && !submitted

  useEffect(() => {
    setSubmitted(window.localStorage.getItem(getStorageKey(orderId)) === 'true')
    setCheckedStorage(true)
  }, [orderId])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function rememberSubmitted() {
    window.localStorage.setItem(getStorageKey(orderId), 'true')
    setSubmitted(true)
    onClose()
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    setPhoto(event.target.files?.[0] ?? null)
  }

  async function uploadPhoto() {
    if (!photo) return null

    const supabase = createClient()
    const extension = photo.name.split('.').pop() ?? 'jpg'
    const path = `${orderId}/${crypto.randomUUID()}.${extension}`
    // TODO: wire upload to Supabase Storage - backend Section 2
    const { error: uploadError } = await supabase.storage
      .from('feedback-photos')
      .upload(path, photo, { upsert: false })

    if (uploadError) return null

    const { data } = await supabase.storage
      .from('feedback-photos')
      .createSignedUrl(path, 60 * 60)

    return data?.signedUrl ?? null
  }

  async function handleSubmit() {
    if (overallRating === 0) return

    setIsSubmitting(true)
    const photoUrl = await uploadPhoto()
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        overallRating,
        foodRating: foodRating || null,
        riderRating: riderRating || null,
        comment: comment.trim() || null,
        photoUrl,
      }),
    }).catch(() => undefined)
    // TODO: wire to real endpoint - backend
    setIsSubmitting(false)
    rememberSubmitted()
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end bg-black/40 px-4 pb-4 sm:items-center sm:justify-center"
        >
          <motion.section
            initial={{ y: 420 }}
            animate={{ y: 0 }}
            exit={{ y: 420 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-muncherz-red">Feedback</p>
                <h2 className="mt-1 text-2xl font-black text-muncherz-black">How was your experience?</h2>
              </div>
              <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-muncherz-white text-gray-500">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <StarRating label={ratingLabels.overall} value={overallRating} onChange={setOverallRating} required />
              <div className="grid gap-4 sm:grid-cols-2">
                <StarRating label={ratingLabels.food} value={foodRating} onChange={setFoodRating} />
                <StarRating label={ratingLabels.rider} value={riderRating} onChange={setRiderRating} />
              </div>

              <label className="block">
                <span className="text-xs font-black text-muncherz-black">Comment</span>
                <textarea
                  value={comment}
                  maxLength={500}
                  onChange={(event) => setComment(event.target.value)}
                  className="mt-2 min-h-24 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm font-bold outline-none focus:border-muncherz-red"
                  placeholder="Tell us what stood out."
                />
                <span className="mt-1 block text-right text-xs font-bold text-gray-400">{comment.length}/500</span>
              </label>

              <label className="block rounded-xl border border-dashed border-gray-300 p-3">
                <span className="text-xs font-black text-muncherz-black">Photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="mt-2 block w-full text-sm font-bold text-gray-500" />
                {previewUrl && <Image src={previewUrl} alt="Feedback preview" width={80} height={80} unoptimized className="mt-3 h-20 w-20 rounded-lg object-cover" />}
              </label>
            </div>

            <button
              type="button"
              disabled={overallRating === 0 || isSubmitting}
              onClick={handleSubmit}
              className="mt-5 w-full rounded-xl bg-muncherz-red px-4 py-4 text-sm font-black text-white transition active:scale-95 disabled:bg-gray-300"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
            <button type="button" onClick={rememberSubmitted} className="mt-3 w-full text-center text-xs font-black text-gray-500">
              Skip
            </button>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function StarRating({ label, value, onChange, required = false }: {
  label: string
  value: number
  onChange: (value: number) => void
  required?: boolean
}) {
  return (
    <div>
      <p className="text-xs font-black text-muncherz-black">{label}{required ? ' *' : ''}</p>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button key={rating} type="button" onClick={() => onChange(rating)} className="grid h-9 w-9 place-items-center">
            <Star className={`h-7 w-7 ${rating <= value ? 'fill-muncherz-yellow text-muncherz-yellow' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>
    </div>
  )
}
