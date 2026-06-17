-- profiles: user reads/updates own row only
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- addresses: user owns their own addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addresses_own" ON addresses FOR ALL
  USING (auth.uid() = user_id);

-- orders: user sees own; restaurant role sees all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_user_select" ON orders FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "orders_restaurant_all" ON orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff_accounts
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- order_items: tied to orders access
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_via_order" ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM staff_accounts
            WHERE user_id = auth.uid() AND is_active = true
          ))
    )
  );

-- saved_creations: user owns own
ALTER TABLE saved_creations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_creations_own" ON saved_creations FOR ALL
  USING (auth.uid() = user_id);

-- feedback: user creates own; restaurant reads/replies all
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_user_insert" ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "feedback_user_select_own" ON feedback FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "feedback_restaurant_all" ON feedback FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff_accounts
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- categories, menu_items, deals: public read; restaurant write
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_restaurant_write" ON categories FOR ALL
  USING (EXISTS (SELECT 1 FROM staff_accounts WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "menu_items_public_read" ON menu_items FOR SELECT USING (true);
CREATE POLICY "menu_items_restaurant_write" ON menu_items FOR ALL
  USING (EXISTS (SELECT 1 FROM staff_accounts WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ingredients_public_read" ON ingredients FOR SELECT USING (true);
CREATE POLICY "ingredients_restaurant_write" ON ingredients FOR ALL
  USING (EXISTS (SELECT 1 FROM staff_accounts WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE menu_item_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mii_public_read" ON menu_item_ingredients FOR SELECT USING (true);
CREATE POLICY "mii_restaurant_write" ON menu_item_ingredients FOR ALL
  USING (EXISTS (SELECT 1 FROM staff_accounts WHERE user_id = auth.uid() AND is_active = true));

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deals_public_read" ON deals FOR SELECT USING (true);
CREATE POLICY "deals_restaurant_write" ON deals FOR ALL
  USING (EXISTS (SELECT 1 FROM staff_accounts WHERE user_id = auth.uid() AND is_active = true));

-- restaurant_settings: public read; owner/manager write only
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read" ON restaurant_settings FOR SELECT USING (true);
CREATE POLICY "settings_manager_write" ON restaurant_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff_accounts
      WHERE user_id = auth.uid()
        AND role IN ('owner','manager')
        AND is_active = true
    )
  );

-- staff_accounts: owner manages; self read
ALTER TABLE staff_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_self_read" ON staff_accounts FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "staff_owner_all" ON staff_accounts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff_accounts sa
      WHERE sa.user_id = auth.uid() AND sa.role = 'owner' AND sa.is_active = true
    )
  );

-- riders: restaurant only
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "riders_restaurant_all" ON riders FOR ALL
  USING (EXISTS (SELECT 1 FROM staff_accounts WHERE user_id = auth.uid() AND is_active = true));

-- kitchen_screens: restaurant only
ALTER TABLE kitchen_screens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kitchen_screens_restaurant_all" ON kitchen_screens FOR ALL
  USING (EXISTS (SELECT 1 FROM staff_accounts WHERE user_id = auth.uid() AND is_active = true));

-- activity_logs: INSERT only — no UPDATE or DELETE for anyone, ever
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_logs_insert_only" ON activity_logs FOR INSERT
  WITH CHECK (true);
CREATE POLICY "activity_logs_staff_read" ON activity_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM staff_accounts WHERE user_id = auth.uid() AND is_active = true));
-- Explicitly: no UPDATE policy, no DELETE policy on this table.

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_menu_item_ingredients_menu_item_id ON menu_item_ingredients(menu_item_id);
CREATE INDEX idx_activity_logs_actor_id ON activity_logs(actor_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
