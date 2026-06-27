CREATE TABLE IF NOT EXISTS developers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE developers ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "developers_self_read"
ON developers FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS staff_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('owner','manager','chef')) DEFAULT 'owner',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE staff_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "staff_self_read"
ON staff_accounts FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS kitchen_screens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  pin TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  failed_attempts INTEGER DEFAULT 0,
  lockout_until TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE kitchen_screens ENABLE ROW LEVEL SECURITY;
