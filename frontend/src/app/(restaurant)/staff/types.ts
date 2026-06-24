export type StaffRole = 'owner' | 'manager' | 'chef';

export interface StaffAccount {
  id: string;
  user_id: string;
  name: string;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
}
