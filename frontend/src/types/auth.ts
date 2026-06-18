export interface DeveloperAccount {
  id: string;
  email: string;
  updated_at: string;
  totp_secret: string;
  has_mfa: boolean;
}

export type UserRole = 'customer' | 'owner' | 'manager' | 'chef' | 'developer' | null;
