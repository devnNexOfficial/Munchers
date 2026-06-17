import { z } from 'zod'

export const OrderPlacementSchema = z.object({
  orderType: z.enum(['delivery', 'dine_in', 'takeaway']),
  tableNumber: z.string().optional(),
  addressId: z.string().uuid().optional(),
  deliveryAddress: z.string().optional(),
  paymentMethod: z.enum(['cod', 'jazzcash', 'easypaisa', 'card']),
  specialNote: z.string().max(200).optional(),
  items: z.array(
    z.object({
      menuItemId: z.string().uuid(),
      quantity: z.number().int().min(1).max(10),
      sizeLabel: z.string().optional(),
      cookingPref: z.string().optional(),
      customizations: z.array(
        z.object({
          ingredientId: z.string().uuid(),
          quantity: z.number().int().min(1).max(10)
        })
      ),
      mealAdditions: z.array(
        z.object({
          item: z.string(),
          price: z.number()
        })
      ).optional()
    })
  ).min(1),
  clientTotal: z.number()
}).superRefine((data, ctx) => {
  if (data.orderType === 'dine_in' && !data.tableNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Table number is required for dine-in orders",
      path: ["tableNumber"]
    })
  }
  if (data.orderType === 'delivery' && !data.addressId && !data.deliveryAddress) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Address ID or delivery address is required for delivery orders",
      path: ["deliveryAddress"]
    })
  }
})

export type OrderPlacementPayload = z.infer<typeof OrderPlacementSchema>
