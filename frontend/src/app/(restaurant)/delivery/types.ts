import { z } from 'zod';

export type StaffRole = 'owner' | 'manager' | 'chef';

export interface Rider {
  id: string;
  name: string;
  phone: string;
  is_active: boolean;
  is_available: boolean;
  created_at: string;
}

export type RiderStatus = 'available' | 'on_delivery' | 'inactive';

export interface DeliverySettings {
  delivery_enabled: boolean;
  free_delivery_km: number;
  delivery_charge: number;
  max_delivery_km: number;
  surge_enabled: boolean;
  surge_charge: number;
  surge_start_time: string | null;
  surge_end_time: string | null;
  qr_dine_in_enabled: boolean;
}

export const deliverySettingsSchema = z.object({
  delivery_enabled: z.boolean(),
  free_delivery_km: z.number().min(0),
  delivery_charge: z.number().min(0),
  max_delivery_km: z.number().min(0),
  surge_enabled: z.boolean(),
  surge_charge: z.number().min(0),
  surge_start_time: z.string().nullable(),
  surge_end_time: z.string().nullable(),
  qr_dine_in_enabled: z.boolean(),
}).refine(data => {
  if (data.surge_enabled) {
    return data.surge_start_time !== null && data.surge_end_time !== null && data.surge_start_time !== '' && data.surge_end_time !== '';
  }
  return true;
}, {
  message: "Start and end times are required",
  path: ["surge_end_time"]
}).refine(data => {
  if (data.surge_enabled && data.surge_start_time && data.surge_end_time) {
    // Assuming format "HH:MM"
    return data.surge_start_time < data.surge_end_time;
  }
  return true;
}, {
  message: "Start time must be before end time",
  path: ["surge_start_time"]
});

export const riderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required')
});
