-- orders
CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      TEXT UNIQUE NOT NULL,
  user_id           UUID REFERENCES profiles(id),
  user_phone        TEXT NOT NULL,
  order_type        TEXT NOT NULL CHECK (order_type IN ('delivery','dine_in','takeaway')),
  table_number      TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','accepted','preparing','ready','dispatched','delivered','cancelled')),
  rejection_reason  TEXT,
  address_id        UUID REFERENCES addresses(id),
  delivery_address  TEXT,
  landmark          TEXT,
  items             JSONB NOT NULL,
  subtotal          DECIMAL(10,2) NOT NULL,
  delivery_charge   DECIMAL(10,2) DEFAULT 0,
  gst_amount        DECIMAL(10,2) DEFAULT 0,
  gst_percent       DECIMAL(5,2) DEFAULT 0,
  discount_amount   DECIMAL(10,2) DEFAULT 0,
  total             DECIMAL(10,2) NOT NULL,
  payment_method    TEXT CHECK (payment_method IN ('cod','jazzcash','easypaisa','card')),
  payment_status    TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  payment_intent_id TEXT UNIQUE,
  prep_time         INTEGER,
  complexity        TEXT CHECK (complexity IN ('green','yellow','red')),
  special_note      TEXT,
  rider_id          UUID,
  accepted_at       TIMESTAMPTZ,
  ready_at          TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- order_items
CREATE TABLE order_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id      UUID REFERENCES menu_items(id),
  menu_item_name    TEXT NOT NULL,
  size_label        TEXT,
  base_price        DECIMAL(10,2) NOT NULL,
  customizations    JSONB,
  meal_additions    JSONB,
  item_total        DECIMAL(10,2) NOT NULL,
  cooking_pref      TEXT,
  quantity          INTEGER DEFAULT 1,
  blueprint_id      UUID
);

-- saved_creations
CREATE TABLE saved_creations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  menu_item_id    UUID REFERENCES menu_items(id),
  name            TEXT NOT NULL,
  customizations  JSONB NOT NULL,
  last_price      DECIMAL(10,2),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- feedback
-- NOTE: also create a 'feedback-photos' Supabase Storage bucket here.
-- Policy: authenticated users can upload only to their own order's path.
CREATE TABLE feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id) UNIQUE,
  user_id         UUID REFERENCES profiles(id),
  rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  photo_url       TEXT,
  food_rating     INTEGER CHECK (food_rating BETWEEN 1 AND 5),
  rider_rating    INTEGER CHECK (rider_rating BETWEEN 1 AND 5),
  is_resolved     BOOLEAN DEFAULT false,
  owner_reply     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- deals
CREATE TABLE deals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  name_ur         TEXT,
  description     TEXT,
  image_url       TEXT,
  deal_price      DECIMAL(10,2) NOT NULL,
  original_price  DECIMAL(10,2),
  items           JSONB NOT NULL,
  customize_limit JSONB,
  is_active       BOOLEAN DEFAULT true,
  valid_from      TIMESTAMPTZ,
  valid_until     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- riders
CREATE TABLE riders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  phone           TEXT UNIQUE NOT NULL,
  is_active       BOOLEAN DEFAULT true,
  is_available    BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- kitchen_screens
CREATE TABLE kitchen_screens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  pin             TEXT NOT NULL,
  is_active       BOOLEAN DEFAULT true,
  last_seen       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- restaurant_settings (seed one row immediately after creation)
CREATE TABLE restaurant_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_name       TEXT DEFAULT 'Antigravity',
  logo_url              TEXT,
  phone                 TEXT,
  address               TEXT,
  open_time             TIME,
  close_time            TIME,
  is_manually_closed    BOOLEAN DEFAULT false,
  delivery_enabled      BOOLEAN DEFAULT true,
  free_delivery_km      DECIMAL(5,2) DEFAULT 3,
  delivery_charge       DECIMAL(10,2) DEFAULT 150,
  max_delivery_km       DECIMAL(5,2) DEFAULT 10,
  surge_enabled         BOOLEAN DEFAULT false,
  surge_charge          DECIMAL(10,2) DEFAULT 50,
  surge_start_time      TIME,
  surge_end_time        TIME,
  min_order_amount      DECIMAL(10,2) DEFAULT 500,
  prep_buffer_minutes   INTEGER DEFAULT 0,
  cod_enabled           BOOLEAN DEFAULT true,
  jazzcash_enabled      BOOLEAN DEFAULT true,
  easypaisa_enabled     BOOLEAN DEFAULT true,
  card_enabled          BOOLEAN DEFAULT true,
  loyalty_enabled       BOOLEAN DEFAULT true,
  loyalty_stamp_count   INTEGER DEFAULT 10,
  loyalty_reward_item   TEXT,
  qr_dine_in_enabled    BOOLEAN DEFAULT false,
  printer_enabled       BOOLEAN DEFAULT false,
  print_copies          INTEGER DEFAULT 1,
  kitchen_lcd_enabled   BOOLEAN DEFAULT true,
  gst_enabled           BOOLEAN DEFAULT false,
  gst_percent           DECIMAL(5,2) DEFAULT 0,
  urdu_enabled          BOOLEAN DEFAULT true,
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- staff_accounts
CREATE TABLE staff_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id),
  name            TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('owner','manager','chef')),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- activity_logs (INSERT only — no UPDATE or DELETE ever allowed)
CREATE TABLE activity_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id        UUID,
  actor_role      TEXT,
  action          TEXT NOT NULL,
  entity          TEXT,
  entity_id       UUID,
  old_value       JSONB,
  new_value       JSONB,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Seed one restaurant_settings row with Antigravity defaults
INSERT INTO restaurant_settings (restaurant_name) VALUES ('Antigravity');
