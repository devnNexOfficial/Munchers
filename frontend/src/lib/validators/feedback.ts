import { z } from 'zod'

export const feedbackSchema = z.object({
  orderId: z.string().uuid(),
  overallRating: z.number().min(1).max(5),
  foodRating: z.number().min(1).max(5).optional(),
  riderRating: z.number().min(1).max(5).optional(),
  comment: z.string().max(500).optional(),
  photoUrl: z.string().url().optional(),
})

export type FeedbackInput = z.infer<typeof feedbackSchema>
