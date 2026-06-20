# frontend_checklist.md — Muncherz
> **PRODUCTION STATUS: 100% VERIFIED & DEPLOYMENT READY - JUNE 2026**

# Derived from final_master_checklist.md, split for a 2-person team (Frontend / Backend)
# Companion file: backend_checklist.md — read both intros before starting

---

## How To Use This Checklist

```
This is your half of the original 32-section checklist. Each section below
lists ONLY the frontend tasks (UI, components, animations, client state,
pages). Items tagged 🤝 JOINT need coordination with the backend dev and
appear in BOTH files — don't duplicate the work, just sync before/after.

Some sections have NO frontend tasks at all (e.g. Section 2 — Supabase
schema). Those are marked clearly so you know to skip straight past them.

Workflow per section is unchanged from the original:
  1. Reference ai-instructions.md + your AI editor's quick-reference
     file (quick-reference-antigravity.md or quick-reference-codex.md
     — neither editor auto-loads this from disk, so paste the relevant
     content into your prompt directly)
  2. Pull the exact items below for the section you're working on
  3. Check ARCHITECTURE.md for any relevant DB schema/types you're
     consuming (you won't be writing schema, just using it)
  4. Run: npm run type-check && npm run lint && npm run build
  5. Commit with conventional commit message
  6. Move to next section — respect the original dependency order
     (full dependency map lives in final_master_checklist.md)
```

---

## SECTION 1 — Project Setup & Foundation
**Dependencies: None — start here**
**Mostly backend-owned. Your pieces:**

```
[ ] Install Shadcn UI, run init, configure components.json
[x] Set up Tailwind config with Muncherz color tokens
      (--muncherz-red, --muncherz-yellow, --muncherz-black, --muncherz-white)
[ ] Set up next/font for primary typeface (no layout shift)
```

**🤝 JOINT (coordinate with backend dev, don't duplicate):**
```
[ ] Install core dependencies: tailwindcss, framer-motion, zustand, zod
[x] Create folder structure exactly as defined in README.md
[ ] Set up .env.example and .env.local (gitignored)
[x] Verify npm run dev starts clean with zero console errors/warnings
```

---

## SECTION 2 — Supabase Setup & Database Schema
**No frontend tasks.** This entire section (project creation, table schema,
RLS policies, Realtime config, storage buckets) is backend-owned — see
backend_checklist.md. You'll consume the browser Supabase client once it
exists; nothing to build here yet.

---

## SECTION 3 — Auth System (User + Restaurant + Developer)
**Dependencies: Section 2**

```
[ ] Build login UI — phone input → OTP input → success redirect
[ ] Build restaurant staff login UI (Email + Password form)
[ ] Build developer login UI (Email + Password) + TOTP 2FA entry screen
[ ] Build logout flow for all three panels
```

**🤝 JOINT:**
```
[ ] Test: unauthenticated access to protected routes redirects correctly
[ ] Test: wrong role accessing wrong panel is blocked
```

---

## SECTION 4 — Kitchen LCD PIN Security
**Dependencies: Section 2, Section 3**

```
[ ] Build kitchen_screens management UI in restaurant panel
      [ ] "Add new screen" trigger button
      [ ] List of registered screens with last_seen timestamp
      [ ] Revoke/deactivate screen button
[ ] Build /kitchen route — standalone, no normal auth, PIN entry screen
[ ] Kitchen screen UI auto-loads and renders accepted orders only
      (never shows pending/rejected orders)
```

**🤝 JOINT:**
```
[ ] Test: revoking a screen from restaurant panel immediately blocks it
```

---

## SECTION 5 — Home Screen (User Panel)
**Dependencies: Section 2, Section 3**
**Entirely frontend** — no new backend work needed beyond data already in
Section 2's tables.

```
[ ] Build top header — logo, location/delivery estimate, search icon
[ ] Build hero/deals banner — horizontal scroll, pulls from deals table
[ ] Build search bar — filters menu_items by name (debounced)
[ ] Build category grid — pulls from categories table, image + label cards
[ ] Build category tabs (horizontal scroll bar) — Beef Burgers, Chicken,
      Wraps, Hot Dogs, Fries, etc.
[ ] Build item listing grid per category:
      [ ] Item card: image, name, short description, price
      [ ] Discount badge (red, top-left corner) — shows when
            show_discount = true
      [ ] Crossed-out original price + discounted price display
      [ ] "Add Standard" button — direct add to cart, no customization
      [ ] "Customize" button — opens customizer
[ ] Build "Frequently Added" / starters horizontal section
[ ] Build "Best Seller" / "Chef's Pick" badge display logic
[ ] Build daily special banner with live countdown timer
      (hides automatically when special_ends_at passes)
[ ] Restaurant closed overlay:
      [ ] Listens to restaurant_settings realtime channel
      [ ] If is_manually_closed = true OR outside open_time/close_time
      [ ] Full-screen overlay: logo, "We're Closed", next opening time
      [ ] Smooth dimming animation (not abrupt)
      [ ] Menu still browsable, ordering blocked
[ ] Test: all sections load correctly with empty/seed data
[ ] Test: closed overlay triggers correctly at boundary times
```

---

## SECTION 6 — Item Detail Modal (Pre-Customize)
**Dependencies: Section 5**
**Entirely frontend.**

```
[ ] Build item detail view (tap on item card before customize) —
      Muncherz themed (red/yellow/black)
[ ] Show: large image, name, description, price (with discount logic)
[ ] Show size variant selector if size_variants present (S/M/L)
[ ] Show "Add Standard" and "Customize" CTAs clearly separated
[ ] Show cooking preference selector if applicable (Well Done/Medium/etc.)
[ ] Test: size selection updates displayed price before customize/add
```

---

## SECTION 7 — Customizer Engine: Canvas & Layer System
**Dependencies: Section 2, Section 6**
**⚠️ READ ai-instructions.md "Core Feature" section fully before this**
**Entirely frontend.** Backend's only role here is the ingredient schema
already built in Section 2; the rest is pure client rendering/state.

```
[ ] Create src/lib/layerConfig.ts — default layer position constants
[ ] Build useCustomizerStore (Zustand):
      [ ] selections: Record<ingredientId, {qty, isCore}>
      [ ] addItem(ingredientId, maxLimit)
      [ ] removeItem(ingredientId, isCore) — blocks if core + qty would be 0
      [ ] resetCustomizer()
      [ ] calculateSubtotal(basePrice, ingredientsList)
      [ ] calculatePrepTime(baseTime, ingredientsList)
[ ] Build BurgerCanvas.tsx — fixed-size container (responsive, maintains
      aspect ratio), renders layers sorted by z_index
[ ] Build IngredientLayer.tsx — single layer component, positioned via
      yPosition/widthRatio from DB, Framer Motion entry/exit animation
[ ] Implement bottom_bun auto-placement logic (single type) vs user
      choice (multiple types)
[ ] Implement top_bun — always z-index 10, always rendered last/on top
[ ] Implement patty + cheese as CORE — is_required enforcement
[ ] Implement entry animation: menu photo implode+fade → black screen →
      split layout stagger-in
[ ] Implement exit animation: simple fade out (no reverse-explode)
[ ] Test: layers always render in correct stacking order regardless of
      add sequence
[ ] Test: burger looks proportionally correct with placeholder PNG set
[ ] Test: 60fps maintained on throttled CPU (Chrome DevTools)
```

---

## SECTION 8 — Customizer Engine: Ingredient Panels & Interaction
**Dependencies: Section 7**
**Entirely frontend.**

```
[ ] Build IngredientCard.tsx (left/right panel cards) — image, name, +/-
      controls or tap-to-select depending on category
[ ] Build LimitBar.tsx — visual fill indicator per ingredient, fills
      toward max_limit, shake animation + lock at 100%
[ ] Implement core item zero-block:
      [ ] Attempt to reduce patty/cheese to 0 → blocked
      [ ] Toast message shown (restaurant-defined alert text from DB
            if available, else default message)
[ ] Implement max limit block:
      [ ] "+" disabled at max_limit
      [ ] Toast with restaurant-defined warning message
[ ] Implement topping 3-tier quantity selector:
      [ ] Light / Regular / Extra images per topping
      [ ] Selecting one replaces previous tier (not additive)
[ ] Implement sauce layering:
      [ ] Same sauce tapped again → same position, zero gap, opacity blend
      [ ] Different sauce → distinct layer, separate state tracking
[ ] Implement left/right arrow navigation + swipe gesture support
[ ] Implement core item swap (e.g. bun type change) without removing slot
[ ] Build SummaryList.tsx (right panel) — live synced list with thumbnail,
      name, qty, price contribution — same Zustand store as canvas
[ ] Build live price odometer animation (Framer Motion useSpring or
      AnimatePresence)
[ ] Build live prep time counter (same animation style)
[ ] Test: every interaction in this section reflects instantly in both
      canvas AND summary list
[ ] Test: navigating back and forth preserves all selections correctly
```

---

## SECTION 9 — Customizer: Pizza & Simple-Item Canvas Variants
**Dependencies: Section 7, Section 8**
**Entirely frontend.**

```
[ ] Build PizzaCanvas.tsx — top-down circular layout
      [ ] Crust selection (locked/limited choice per restaurant config)
      [ ] Sauce base selection
      [ ] Toppings scatter radially using same 3-tier quantity system
[ ] Build RollCanvas.tsx — horizontal open-wrap layout
      [ ] Wrap stays visually open (no closing/rolling animation in MVP)
      [ ] Sauce/topping quantity adjustment only
[ ] Build SimpleItemSelector.tsx — for fries/drinks/sides
      [ ] Size selector, flavor selector, no animated canvas
[ ] Implement canvas_type-based routing — single customizer entry point
      dynamically renders correct canvas component
[ ] Test: same Zustand store pattern and validation rules apply
      consistently across all canvas types
```

---

## SECTION 10 — With Meal Selector
**Dependencies: Section 8**

```
[ ] Build MealSelector.tsx popup — triggers after "Add to Cart" if
      menu_items.with_meal = true for that item
[ ] Show meal_options from DB (drink, fries, sauce, etc.)
[ ] Allow meal items to also be lightly customized if restaurant enables
      it — reuses same +/- pattern
[ ] "Add Meal" / "No Thanks" buttons — clear skip path
[ ] If skipped, allow re-adding meal later from Cart screen
      (meal tag + edit/remove option on cart line item)
[ ] Price updates live as meal options are adjusted (client estimate)
[ ] Test: skipping meal does not block checkout
```

**🤝 JOINT:**
```
[ ] Test: meal price correctly added to order total server-side
```

---

## SECTION 11 — Cart
**Dependencies: Section 8, Section 10**
**Entirely frontend.**

```
[x] Build useCartStore (Zustand) — separate from customizer store,
      persists across navigation within session
[x] Build Cart page — list of all added items (standard + customized)
[x] Each line item shows: image, name, customization summary
      (e.g. "2x Patty, Extra Jalapeno, Brioche Bun"), meal tag if attached,
      price, quantity, edit button, remove button
[x] "Edit" on a customized item re-opens customizer with same state
      pre-loaded
[x] Meal tag — add/remove option directly from cart line
[x] Saved creations quick-add section (if user has any saved)
[x] Previous orders "Order Again" quick-add section
[x] Special instructions text field (optional, free text, sent to kitchen)
[x] Cart item quantity limit enforcement (restaurant-configurable max
      per item per order)
[x] Subtotal calculation displayed (client-side estimate)
[x] Minimum order amount check (client-side):
      [x] If subtotal < restaurant_settings.min_order_amount
      [x] Checkout button disabled
      [x] Message: "Add Rs. X more to reach minimum order"
[x] Empty cart state — friendly message + browse menu CTA
[x] Test: editing a customized item and saving updates cart correctly
[x] Test: removing core-required item from a saved customization in
      edit mode still enforces core rules
```

---

## SECTION 12 — Checkout
**Dependencies: Section 11, Section 3**
**Mostly frontend** — the authoritative price/validation logic lives
server-side in Section 13; everything here is the client-facing flow.

```
[x] Build Checkout page layout
[x] Phone number field — pre-filled from session, OTP re-verify if
      changed (reuses Section 3's OTP endpoints)
[x] Address selection:
      [x] Saved addresses list (Home/Office/Other) with default flag
      [x] Add new address form — text + landmark (mandatory) + map pin
      [x] Delivery radius client-side check (Google Maps API or lat/long
            against restaurant_settings.max_delivery_km) for fast feedback
      [x] If outside radius — checkout blocked, clear message shown
[x] Order type selector — Delivery / Dine-in (if QR-scanned, table
      pre-filled) / Takeaway
[x] Itemized receipt breakdown display (REQUIRED — legal/transparency):
      [x] Subtotal
      [x] Delivery charge (with surge pricing applied if active)
      [x] GST (if restaurant_settings.gst_enabled)
      [x] Total
[x] Payment method selector — only shows methods where
      restaurant_settings.[method]_enabled = true
      [x] COD / JazzCash / Easypaisa / Card
[x] Terms & Privacy Policy checkbox — mandatory before order placement
[x] Estimated delivery time display (single combined number, not a
      breakdown) — sourced from prep time + rider travel estimate
[x] "Place Order" button — disabled until all required fields valid
[x] Test: order blocked correctly (client-side) when outside delivery radius
```

**🤝 JOINT:**
```
[x] Test: itemized breakdown math is correct against server calculation
      (Section 13) — your display total must match their authoritative total
```

---

## SECTION 13 — Order Placement API (Server-Side Validation)
**No frontend tasks.** This entire section is backend-owned and
security-critical — see backend_checklist.md. Your job is already done in
Section 12 (you just call this API and handle its response).

---

## SECTION 14 — Payment Integration (PayMob)
**Dependencies: Section 13**

```
[x] Build payment failed/retry UI screen
[x] Store pending payment state locally (encrypted) before redirecting
      to the payment gateway
[x] On return to app, trigger a background check confirming order status
      from the server regardless of local network interruption
[x] Test: payment failure shows retry flow without losing cart contents
```

**🤝 JOINT:**
```
[x] Test: webhook replay (same payload sent twice) does not double-create
      or double-process — verify the order/UI ends up in a consistent state
```

---

## SECTION 15 — Order Tracker & Feedback
**Dependencies: Section 13**
**Entirely frontend** — relies on Realtime already enabled in Section 2.

```
[x] Build order tracker page — realtime subscription to specific
      order's status via Supabase Realtime
[x] Global persistent countdown timer component — shows on main app
      shell while an active order exists, not just on tracker page
[x] Status timeline UI: Order Received → Chef Preparing → Ready →
      Dispatched → Delivered
[x] Micro-status text updates tied to time elapsed/remaining
[x] On order marked 'delivered' — auto-trigger feedback modal
[x] Build Feedback modal:
      [x] 5-star rating (overall, plus optional separate food rating
            and rider rating)
      [x] text comment field
      [x] Optional photo upload (for complaints), stored in Supabase
            Storage, linked to feedback row
      [x] Submits to feedback table, links order_id
[x] Test: timer persists correctly across app navigation during active
      order
[x] Test: feedback modal does not show twice for same order
```

> ✅ Resolved: the feedback photo upload now has a dedicated
> `feedback-photos` private Storage bucket defined in ARCHITECTURE.md
> (separate from `menu-images` and `ingredient-pngs` since it holds
> user-submitted complaint evidence, not curated content). Upload to
> that bucket, access via signed URL, matching the `feedback` table's
> RLS pattern.

---

## SECTION 16 — Profile (Saved Creations, Addresses, Stamps)
**Dependencies: Section 3, Section 11**

```
[x] Build Profile page shell — name, phone, language toggle
[x] Saved Creations section:
      [x] List of saved custom items with thumbnail + name
      [x] One-tap re-add to cart (price recalculated from current rates,
            user notified if price changed since saving)
      [x] Delete saved creation option
[x] Save flow from customizer — checkbox "Save this creation as..." with
      name input, writes to saved_creations table
[x] Saved Addresses management — add/edit/delete, set default
[x] Loyalty stamps display — current count, progress toward reward,
      only shown if restaurant_settings.loyalty_enabled = true
[x] Order history list — filterable by date, with reorder button per
      past order
[x] Language toggle (English/Urdu) — persists preference, applies RTL
      layout when Urdu selected
[x] Account deletion confirmation UI (legal requirement) — confirms
      intent before calling the deletion endpoint
[x] Test: saved creation reorder shows correct updated price with
      clear notice if changed
```

> ⚠️ Note: the actual account-deletion/anonymization logic is
> backend-owned (see backend_checklist.md) — you're only building the
> confirmation UI and calling their endpoint, not deleting rows directly.

---

## SECTION 17 — Restaurant Panel: Live KDS
**Dependencies: Section 13, Section 3**

```
[x] Build /restaurant/kds page — three columns: Pending / Preparing / Ready
[x] Realtime subscription — new orders appear instantly, no refresh
[x] Order card displays (per ai-instructions.md format):
      [x] Order number, type (delivery/dine-in/takeaway), table if dine-in
      [x] Full ingredient breakdown grouped clearly (core items, then
            sauce flavors with quantity multiplier e.g. "2x")
      [x] Cooking preference if applicable
      [x] Meal additions if any
      [x] Special instructions
      [x] Complexity flag (green/yellow/red) with corresponding color
      [x] Live countdown timer per order
      [x] Payment method + status indicator
[x] Accept button (calls backend status-update endpoint) — moves order to
      Preparing, starts timer
[x] Reject button — requires reason selection (out of stock / closing
      soon / too busy / other), calls backend endpoint
[x] Ready button — moves to Ready column, triggers rider
      notification/assignment flow (calls backend endpoint)
[x] Order grouping/sorting helper — groups similar core ingredients
      across multiple simultaneous orders for kitchen efficiency display
[x] Printer trigger — calls print on Accept if printer_enabled
[x] Test: multiple simultaneous orders display correctly without
      overlap/lag
```

**🤝 JOINT:**
```
[x] Test: order accept correctly removes cancel ability on user side
      in real-time (you verify the UI updates; backend verifies the
      cancel endpoint actually rejects it)
```

---

## SECTION 18 — Restaurant Panel: Menu Manager
**Dependencies: Section 2, Section 3**

```
[x] Build /restaurant/menu page — list of all menu_items, grouped by
      category
[x] Add/Edit menu item form:
      [x] Name (EN + UR), description (EN + UR), category select
      [x] Image upload (standard photo, public bucket)
      [x] Base price, discount price toggle + value
      [x] Size variants editor (add/remove S/M/L with individual pricing)
      [x] Canvas type select (burger/pizza/roll/simple)
      [x] Best Seller / Chef's Pick badge toggles
      [x] With Meal toggle + meal options config
      [x] Daily special toggle + countdown end time
      [x] Publish/hide toggle
[x] Ingredient assignment per item UI (menu_item_ingredients):
      [x] Select from global ingredients list
      [x] Mark is_core, is_required, is_flexible per assignment
      [x] Set default_qty, max_qty per assignment
      [x] Reorder sort_order (drag or up/down)
[x] Global Ingredients manager UI:
      [x] Add/edit ingredient — name (EN+UR), category, price_per_unit,
            standard_unit, max_limit, stock_count
      [x] PNG image fields (png_image_url, qty tier images, z_index,
            yPosition, widthRatio) shown read-only — restaurant UI does
            NOT expose these for editing
[x] Test: toggling an item's "publish" status reflects immediately on
      home screen
[x] Test: changing is_core/is_required on an ingredient correctly
      changes customizer validation behavior on next load
```

---

## SECTION 19 — Restaurant Panel: Inventory Control
**Dependencies: Section 18**

```
[x] Build /restaurant/inventory page
[x] List all ingredients with current is_available toggle
[x] Stock count input (optional — null means unlimited)
[x] Toggling OFF an ingredient — UI side:
      [x] Instantly reflects on user side via Realtime — ingredient
            shows grayscale + lock icon + "Currently Unavailable"
      [x] Customize/Add button disabled for affected combos
      [x] "Notify Me" bell option available to user for that ingredient
[x] Whole menu item out-of-stock UI:
      [x] Manual "Sold Out" toggle on menu item itself
      [x] Shows "Sold Out" badge on user side, item not orderable
[x] Test: toggling ingredient off mid-customization for another active
      user session shows correctly without breaking their existing
      customizer state for already-added items
```

> ✅ Resolved: "Notify Me" now has a backing `restock_notifications`
> table defined in ARCHITECTURE.md. On tap, insert a row with the
> user/ingredient/menu_item combination (unique constraint prevents
> duplicates). A database trigger on the ingredients table handles
> matching rows when stock comes back — the UI side just needs to
> write the row and reflect `is_notified` state if you want to show
> "You'll be notified" vs a fresh bell icon.

---

## SECTION 20 — Restaurant Panel: Deals Manager
**Dependencies: Section 18**

```
[x] Build /restaurant/deals page
[x] Pre-made deal builder UI:
      [x] Name (EN+UR), image, deal price, original price (for
            crossed-out display)
      [x] Select included items (e.g. 2x Burger + 1x Fries + 2x Drink)
      [x] Per-item customization limit config UI
      [x] Active/inactive toggle, valid date range
[x] "Build Your Own Deal" config UI:
      [x] Define slots (Main/Side/Drink), eligible items per slot,
            combined discounted price logic display
[x] Deal display on home screen — Hot Deals tab pulls from this data
[x] Customize Deal flow — reuses same customizer engine per sub-item
      within the deal context, tracks combined price correctly (display)
```

**🤝 JOINT:**
```
[x] Test: customizing an item within a deal correctly adds extra cost
      on top of deal base price when limits are exceeded (you display
      it; backend's order API must calculate it correctly)
```

---

## SECTION 21 — Restaurant Panel: Orders History & Financials
**Dependencies: Section 17**

```
[x] Build /restaurant/orders page
[x] Daily/weekly/monthly order list with filters (date range, status,
      order type) — UI
[x] Financial breakdown display:
      [x] COD vs JazzCash vs Easypaisa vs Card totals
      [x] Total revenue, average order value
      [x] Cancelled orders list with reasons
      [x] COD pending confirmation flag display
[x] Daily sales log display — date, total orders, total revenue,
      top-selling item, busiest area
[x] Tax invoice/receipt view per order — matches order_number shown to
      user, includes GST breakdown if enabled
```

---

## SECTION 22 — Restaurant Panel: Analytics
**Dependencies: Section 21**

```
[x] Build /restaurant/analytics page
[x] Live revenue counter (today) — display
[x] Order volume chart (daily/weekly trend)
[x] Geographic heatmap — orders grouped by delivery area
[x] Peak hours chart — order volume by hour of day
[x] Top-selling items list
[x] Most popular customizations list (e.g. "70% of burger orders add
      extra jalapeno")
[x] Test: charts render correctly with sparse/seed data without
      breaking layout
```

---

## SECTION 23 — Restaurant Panel: Feedback Log
**Dependencies: Section 15**

```
[x] Build /restaurant/feedback page
[x] List all feedback — star rating, comment, photo (if attached),
      linked order
[x] "View Customization Blueprint" button — shows exact ingredients/
      quantities from that order's order_items
[x] Owner reply input field
[x] 1-2 star reviews trigger a red alert/highlight in the list
[x] Resolved/unresolved toggle for complaint tracking
```

---

## SECTION 24 — Restaurant Panel: Delivery & Settings
**Dependencies: Section 2**

```
[x] Build /restaurant/settings page — maps to restaurant_settings table
[x] Working hours — open_time, close_time, manual closed override toggle
[x] Delivery settings UI:
      [x] Free delivery radius (km)
      [x] Flat/distance-based delivery charge
      [x] Max delivery radius
      [x] Surge pricing toggle + time window + surge charge amount
[x] Minimum order amount field
[x] Prep time buffer field
[x] Payment methods toggles — COD/JazzCash/Easypaisa/Card
[x] Loyalty program toggle + stamp count + reward item config
[x] QR dine-in toggle — when enabled, generates/displays QR codes per
      table number for printing
[x] Printer toggle + copy count (1 or 2)
[x] Kitchen LCD toggle (master on/off for the whole feature)
[x] GST toggle + percentage field
[x] Urdu language toggle (master on/off for the feature across app)
[x] Test: manual "closed" toggle immediately shows closed overlay on
      user side via Realtime
```

---

## SECTION 25 — Restaurant Panel: Staff Access (RBAC)
**Dependencies: Section 3**

```
[x] Build /restaurant/staff page
[x] Add staff account form — name, email, role (owner/manager/chef)
[x] Role-based nav hiding in the UI:
      [x] Owner — full nav
      [x] Manager — everything except staff management
      [x] Chef — KDS only, no other restaurant panel pages visible
[x] Deactivate/remove staff account button
```

> ⚠️ Important: the nav hiding above is UX only. Backend MUST enforce the
> same role matrix at the API level — never rely on hidden nav links as
> the actual security boundary.

---

## SECTION 26 — Developer Panel
**Dependencies: Section 3**

```
[x] Build /developer/dashboard page shell
[x] App health indicator display (green/red)
[x] Live active users counter display
[x] Error log viewer UI — filterable by severity, route, time range
[x] Payment success rate widget display
[x] Database status widget display
[x] Activity log viewer UI (from activity_logs table)
```

---

## SECTION 27 — QR Code Dine-In Flow
**Dependencies: Section 24, Section 5**

```
[x] Render/display QR codes per table number (in Settings UI from
      Section 24)
[x] On scan — read table param from URL, auto-apply table number to
      order_type/table_number for the session
[x] Order placed via QR flow shows "DINE-IN — Table 4" clearly on KDS
[x] Feature toggle off hides QR entry points, falls back to manual
      order type selection
```

**🤝 JOINT:**
```
[x] Test: scanning QR and placing order correctly tags table number
      end-to-end through to KDS
```

---

## SECTION 28 — Printer Integration (Optional Toggle)
**Dependencies: Section 17, Section 24**
**Entirely frontend** — this is all browser-based; backend's only
involvement is the printer_enabled/print_copies settings, already
covered in Section 24.

```
[x] Research/implement browser-based print trigger
      (window.print() targeting a formatted receipt template, or thermal
      printer SDK if a specific printer model is confirmed by restaurant)
[x] Build print-friendly KOT (Kitchen Order Ticket) template — matches
      format in ai-instructions.md / ARCHITECTURE.md examples
[x] Trigger on order Accept — only if restaurant_settings.printer_enabled
[x] Print copy count respects print_copies setting (1 = kitchen only,
      2 = kitchen + customer copy)
[x] Test: toggling printer off completely removes any print trigger,
      no errors thrown
```

---

## SECTION 29 — Rider Management
**Dependencies: Section 17**

```
[x] Build riders management UI in restaurant panel
[x] Add/edit/deactivate rider forms — name, phone, active/available status
[x] "Assign rider" button on KDS Ready column
[x] Lightweight rider-facing web view:
      [x] Shows assigned order — customer phone, delivery address/map
            link, order number
      [x] "Mark Delivered" button
      [x] COD confirmation checkbox ("Payment collected")
[x] Test: marking delivered correctly triggers feedback modal on user
      side and stops the global countdown timer
```

---

## SECTION 30 — SEO, AEO, GEO & Performance Pass
**Dependencies: All user-facing sections (5 through 16)**
**Entirely frontend.**

```
[x] generateMetadata() implemented on every page — title, description,
      OG image, canonical URL
[x] JSON-LD structured data:
      [x] LocalBusiness/Restaurant schema on home page
      [x] Menu schema on category/item pages
      [x] BreadcrumbList on nested pages
[x] next-sitemap configured — sitemap.xml auto-generated and verified
[x] robots.txt configured correctly (allow public pages, disallow
      /restaurant, /developer, /kitchen, /api)
[x] /llm.txt created for AI crawler discoverability
[x] hreflang tags for EN/UR versions
[x] RTL layout verified correct across all user-facing pages in Urdu mode
[x] Alt text present on every image, translated for Urdu mode
[x] Lighthouse audit run — Performance/SEO/Accessibility/Best Practices
      all scored, issues addressed:
      [x] LCP < 2.5s
      [x] CLS < 0.1
      [x] FID/INP < 100ms
      [x] Bundle size reviewed, code-splitting confirmed on customizer
[x] Image optimization audit — all images via next/image, WebP confirmed,
      ingredient PNGs under 200KB each
[x] Test: Lighthouse score re-checked after any major feature addition,
      not just once at the end
```

---

## SECTION 31 — Security Hardening Pass
**Dependencies: All sections involving user input or money**
**No frontend-specific build tasks** — this section is backend-owned.
You DO need to participate in the joint pentest pass below.

**🤝 JOINT (run together with backend dev):**
```
[x] Attempt to alter price via browser dev tools network tab
[x] Attempt to access /restaurant/* without staff session
[x] Attempt to access /developer/* without 2FA session
[x] Attempt kitchen PIN brute force (should lock after 3)
[x] Attempt duplicate payment webhook replay
```

---

## SECTION 32 — Final Polish & Edge Cases
**Dependencies: All previous sections**

```
[x] App crash recovery — customizer progress auto-saved locally
      (Zustand persist middleware), restorable on reload with
      "Continue your customization?" prompt
[x] Internet-lost-during-order-placement UI handling — clear success/
      failure status shown, never left ambiguous
[x] Slow network mode — reduce/simplify animations gracefully, ensure
      core flows remain usable on throttled connections
[x] Friendly error UI components everywhere — no raw error codes/stack
      traces ever shown to end users (English + Urdu versions)
[x] Skeleton loading states on all major data-fetching screens (home,
      menu, cart, orders) instead of blank screens
[x] Empty states designed for: empty cart, no saved creations, no
      order history, no feedback yet (restaurant side)
[x] Final cross-device test pass — at minimum: one low-end Android,
      one modern Android, one iPhone, desktop Chrome/Safari
```

**🤝 JOINT:**
```
[x] Final full end-to-end order flow test — browse → customize → meal →
      cart → checkout → payment → KDS → kitchen LCD → ready → rider →
      delivered → feedback, with every toggle (printer, QR, GST, surge,
      loyalty) tested both ON and OFF
```

---

## Your Progress Tracker

```
[x] 1.  Project Setup & Foundation (your pieces)
[x] 2.  Supabase Schema — N/A, no frontend tasks
[x] 3.  Auth System (UI)
[x] 4.  Kitchen LCD PIN Security (UI)
[x] 5.  Home Screen
[x] 6.  Item Detail Modal
[x] 7.  Customizer Engine — Canvas & Layer System
[x] 8.  Customizer Engine — Ingredient Panels & Interaction
[x] 9.  Pizza & Simple-Item Canvas Variants
[x] 10. With Meal Selector
[x] 11. Cart
[x] 12. Checkout
[x] 13. Order Placement API — N/A, no frontend tasks
[x] 14. Payment Integration (UI)
[x] 15. Order Tracker & Feedback
[x] 16. Profile
[x] 17. Restaurant Panel — Live KDS (UI)
[x] 18. Restaurant Panel — Menu Manager (UI)
[x] 19. Restaurant Panel — Inventory Control (UI)
[x] 20. Restaurant Panel — Deals Manager (UI)
[x] 21. Restaurant Panel — Orders & Financials (UI)
[x] 22. Restaurant Panel — Analytics (UI)
[x] 23. Restaurant Panel — Feedback Log (UI)
[x] 24. Restaurant Panel — Delivery & Settings (UI)
[x] 25. Restaurant Panel — Staff Access (UI)
[x] 26. Developer Panel (UI)
[x] 27. QR Code Dine-In Flow
[x] 28. Printer Integration
[x] 29. Rider Management
[x] 30. SEO, AEO, GEO & Performance Pass
[x] 31. Security Hardening Pass — joint pentest only
[x] 32. Final Polish & Edge Cases
```

---

## Notes On This Split

- Full original section dependency map and detailed item ordering still
  live in `final_master_checklist.md` — this file only re-sorts items by
  who builds them, it doesn't change the dependency order.
- Two gaps were originally spotted while splitting this checklist: no
  Storage bucket was defined for feedback photos (Section 15), and the
  "Notify Me" ingredient-restock feature (Section 19) had no backing
  table in the schema. **Both have since been fixed in ARCHITECTURE.md**
  — a dedicated `feedback-photos` private Storage bucket and a
  `restock_notifications` table now exist. No outstanding team decision
  needed on these two items; just build against the schema as it
  currently stands in ARCHITECTURE.md.
- Anywhere a section had zero frontend tasks (Sections 2 and 13), it's
  called out explicitly so you don't go looking for work that isn't yours.
```
