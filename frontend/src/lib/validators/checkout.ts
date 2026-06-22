import { z } from 'zod'

export const addressLabelSchema = z.enum(['Home', 'Office', 'Other'])
export const orderTypeSchema = z.enum(['delivery', 'dine_in', 'takeaway'])
export const paymentMethodSchema = z.enum(['cod', 'jazzcash', 'easypaisa', 'card'])

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+92|92|0)?3\d{9}$/, 'Enter a valid Pakistani mobile number')

export const addressSchema = z.object({
  address_text: z.string().trim().min(10, 'Address must be at least 10 characters'),
  landmark: z.string().trim().min(5, 'Landmark must be at least 5 characters'),
  label: addressLabelSchema,
  lat: z.number().optional(),
  lng: z.number().optional(),
})

export const checkoutFormSchema = z
  .object({
    phone: phoneSchema,
    addressId: z.string().uuid().optional(),
    newAddress: addressSchema.optional(),
    orderType: orderTypeSchema,
    tableNumber: z.string().trim().optional(),
    paymentMethod: paymentMethodSchema,
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: 'Terms and Privacy Policy must be accepted' }),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.orderType === 'delivery' && !data.addressId && !data.newAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['addressId'],
        message: 'Select a saved address or add a new one',
      })
    }

    if (data.addressId && data.newAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['newAddress'],
        message: 'Use either a saved address or a new address',
      })
    }

    if (data.orderType === 'dine_in' && !data.tableNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tableNumber'],
        message: 'Table number is required for dine-in orders',
      })
    }
  })

export type AddressInput = z.infer<typeof addressSchema>
export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>
