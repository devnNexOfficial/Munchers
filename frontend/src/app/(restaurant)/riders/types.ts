import { z } from 'zod';

export interface Rider {
  id: string;
  name: string;
  phone: string;
  is_active: boolean;
  is_available: boolean;
  created_at: string;
}

export type RiderStatus = 'available' | 'busy' | 'inactive';

export type StaffRole = 'owner' | 'manager' | 'chef';

export const riderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required')
});
