export type StaffRole = 'owner' | 'manager' | 'chef';

export interface FeedbackEntry {
  id: string;
  order_id: string;
  order_number: string;
  order_type: string;
  order_total: number;
  user_name: string | null; // null if RLS blocks profiles read. NO PHONE NUMBER.
  rating: number;
  food_rating: number | null;
  rider_rating: number | null;
  comment: string | null;
  photo_signed_url: string | null; // never the raw path
  is_resolved: boolean;
  owner_reply: string | null;
  created_at: string;
}
