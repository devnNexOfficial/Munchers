'use client'

import { Star } from 'lucide-react'

interface FeedbackRatingSectionProps {
  overallRating: number
  setOverallRating: (val: number) => void
  foodRating: number
  setFoodRating: (val: number) => void
  riderRating: number
  setRiderRating: (val: number) => void
}

export function FeedbackRatingSection({
  overallRating,
  setOverallRating,
  foodRating,
  setFoodRating,
  riderRating,
  setRiderRating,
}: FeedbackRatingSectionProps) {
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
    <>
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
    </>
  )
}
