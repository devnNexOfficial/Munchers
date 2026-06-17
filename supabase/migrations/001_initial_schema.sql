-- profiles
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id),
  phone         TEXT UNIQUE NOT NULL,
  name          TEXT,
  language      TEXT DEFAULT 'en' CHECK (language IN ('en', 'ur')),
  loyalty_stamps INTEGER DEFAULT 0,
  is_blocked    BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- addresses
CREATE TABLE addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  label         TEXT,
  address_text  TEXT NOT NULL,
  landmark      TEXT,
  latitude      DECIMAL(10,8),
  longitude     DECIMAL(11,8),
  is_default    BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- categories
CREATE TABLE categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  name_ur       TEXT,
  slug          TEXT UNIQUE NOT NULL,
  image_url     TEXT,
  sort_order    INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- menu_items
CREATE TABLE menu_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID REFERENCES categories(id),
  name            TEXT NOT NULL,
  name_ur         TEXT,
  description     TEXT,
  description_ur  TEXT,
  image_url       TEXT NOT NULL,
  base_price      DECIMAL(10,2) NOT NULL,
  discount_price  DECIMAL(10,2),
  show_discount   BOOLEAN DEFAULT false,
  size_variants   JSONB,
  canvas_type     TEXT DEFAULT 'burger' CHECK (canvas_type IN ('burger','pizza','roll','simple')),
  base_prep_time  INTEGER DEFAULT 15,
  is_available    BOOLEAN DEFAULT true,
  is_featured     BOOLEAN DEFAULT false,
  is_best_seller  BOOLEAN DEFAULT false,
  with_meal       BOOLEAN DEFAULT false,
  meal_options    JSONB,
  daily_special   BOOLEAN DEFAULT false,
  special_ends_at TIMESTAMPTZ,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ingredients
CREATE TABLE ingredients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  name_ur         TEXT,
  category        TEXT NOT NULL CHECK (category IN ('bun','patty','cheese','sauce','topping','drink','side')),
  png_image_url   TEXT NOT NULL,
  png_qty_low     TEXT,
  png_qty_medium  TEXT,
  png_qty_high    TEXT,
  z_index         INTEGER NOT NULL,
  y_position      TEXT NOT NULL,
  width_ratio     TEXT NOT NULL,
  price_per_unit  DECIMAL(10,2) DEFAULT 0,
  standard_unit   TEXT DEFAULT 'piece',
  max_limit       INTEGER DEFAULT 3,
  is_core         BOOLEAN DEFAULT false,
  is_required     BOOLEAN DEFAULT false,
  extra_prep_time INTEGER DEFAULT 0,
  is_available    BOOLEAN DEFAULT true,
  stock_count     INTEGER,
  low_stock_alert INTEGER DEFAULT 5,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- menu_item_ingredients
-- IMPORTANT: is_core/is_required HERE are the runtime source of truth.
-- ingredients-level flags are defaults only. Never read ingredients-level
-- flags at runtime — always read from this table.
CREATE TABLE menu_item_ingredients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id    UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  ingredient_id   UUID REFERENCES ingredients(id),
  is_core         BOOLEAN DEFAULT false,
  is_required     BOOLEAN DEFAULT false,
  is_flexible     BOOLEAN DEFAULT true,
  default_qty     INTEGER DEFAULT 1,
  max_qty         INTEGER DEFAULT 3,
  sort_order      INTEGER DEFAULT 0
);
