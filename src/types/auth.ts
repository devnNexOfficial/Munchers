import { z } from 'zod'

export type UserRole = 'user' | 'owner' | 'manager' | 'chef'

export interface AuthSession {
  user: any
  session: any
}

export const OtpSendRequestSchema = z.object({
  phone: z.string().regex(/^(?:\+923\d{9}|03\d{9})$/, "Must be a valid Pakistani phone number")
})
export type OtpSendRequest = z.infer<typeof OtpSendRequestSchema>

export const OtpVerifyRequestSchema = z.object({
  phone: z.string().regex(/^(?:\+923\d{9}|03\d{9})$/, "Must be a valid Pakistani phone number"),
  token: z.string().length(6, "Token must be 6 digits")
})
export type OtpVerifyRequest = z.infer<typeof OtpVerifyRequestSchema>
