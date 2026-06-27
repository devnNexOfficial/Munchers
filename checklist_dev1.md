# checklist_dev1.md — Muncherz
# DEVELOPER 1 — User-Facing Core Experience
# ============================================================
# IMPORTANT — READ BEFORE STARTING ANY SECTION:
#
# 1. Read ai-instructions.md FULLY every session before writing code
# 2. Read ARCHITECTURE.md for DB schema/types you will consume
# 3. Paste quick-reference-codex.md content into EVERY prompt
#    (Codex does not auto-load it — paste it manually each time)
# 4. One checklist item at a time — never skip ahead
# 5. After every section: npm run type-check && npm run lint && npm run build
# 6. Commit with conventional commit message before moving to next section
#
# YOUR SECTIONS: 3, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16
# SHARED AT END (with Dev 2): 30, 31, 32
# NOT YOUR SECTIONS: 1 (done), 2 (backend), 4 (Dev 2),
#   13 (backend), 17-29 (Dev 2)
#
# Stack reminder (do not deviate, do not change versions):
# Next.js 15, React 18, TypeScript strict, Tailwind 3.x,
# Shadcn UI, Framer Motion 11.x, Zustand 4.x, Zod 3.x,
# Supabase (consume only — do not write schema/RLS)
#
# Theme reminder:
# Page backgrounds = muncherz-white (#FAFAFA)
# Cards/surfaces = white (#FFFFFF)
# Primary CTA = muncherz-red (#D62828)
# Accents/badges = muncherz-yellow (#F7B731)
# Customizer canvas ONLY = muncherz-black (#0A0A0A)
# NO dark theme (#121212, #111111, bg-gray-900) anywhere else
# ============================================================

---

## How To Use This Checklist

```
This is your half of the frontend checklist. Each section lists
ONLY your UI tasks (components, animations, client state, pages).
Items tagged 🤝 JOINT need coordination with the backend dev —
don't duplicate the work, just sync before/after.

Workflow per section:
  1. Reference ai-instructions.md + quick-reference-codex.md
     (paste content into every prompt — Codex won't auto-load it)
  2. Pull the exact items below for the section you're working on
  3. Check ARCHITECTURE.md for DB schema/types you're consuming
  4. Run: npm run type-check && npm run lint && npm run build
  5. Commit with conventional commit message
  6. Move to next section only after current section fully passes
```

---

## SECTION 3 — Auth System (User + Restaurant + Developer)
**Dependencies: Section 2 (backend must be done first)**

```
[x] Build login UI — phone input → OTP input → success redirect
[x] Build restaurant staff login UI (Email + Password form)
[x] Build developer login UI (Email + Password) + TOTP 2FA entry screen
[x] Build logout flow for all three panels
```

**🤝 JOINT:**
```
[ ] Test: unauthenticated access to protected routes redirects correctly
[ ] Test: wrong role accessing wrong panel is blocked
```

---

## SECTION 5 — Home Screen (User Panel)
**Dependencies: Section 2, Section 3**
**Entirely frontend** — no new backend work needed beyond data already
in Section 2's tables.

```
[x] Build top header — logo, location/delivery estimate, search icon
[x] Build hero/deals banner — horizontal scroll, pulls from deals table
[x] Build search bar — filters menu_items by name (debounced)
[x] Build category grid — pulls from categories table, image + label cards
[x] Build category tabs (horizontal scroll bar) — Beef Burgers, Chicken,
      Wraps, Hot Dogs, Fries, etc.
[x] Build item listing grid per category:
      [x] Item card: image, name, short description, price
      [x] Discount badge (red, top-left corner) — shows when
            show_discount = true
      [x] Crossed-out original price + discounted price display
      [x] "Add Standard" button — direct add to cart, no customization
      [x] "Customize" button — opens customizer
[x] Build "Frequently Added" / starters horizontal section
[x] Build "Best Seller" / "Chef's Pick" badge display logic
[x] Build daily special banner with live countdown timer
      (hides automatically when special_ends_at passes)
[x] Restaurant closed overlay:
      [x] Listens to restaurant_settings realtime channel
      [x] If is_manually_closed = true OR outside open_time/close_time
      [x] Full-screen overlay: logo, "We're Closed", next opening time
      [x] Smooth dimming animation (not abrupt)
      [x] Menu still browsable, ordering blocked
[x] Test: all sections load correctly with empty/seed data
[x] Test: closed overlay triggers correctly at boundary times
```

---

## SECTION 6 — Item Detail Modal (Pre-Customize)
**Dependencies: Section 5**
**Entirely frontend.**

```
[x] Build item detail view (tap on item card before customize) —
      Muncherz themed (red/yellow/black)
[x] Show: large image, name, description, price (with discount logic)
[x] Show size variant selector if size_variants present (S/M/L)
[x] Show "Add Standard" and "Customize" CTAs clearly separated
[x] Show cooking preference selector if applicable (Well Done/Medium/etc.)
[x] Test: size selection updates displayed price before customize/add
```

---

## SECTION 7 — Customizer Engine: Canvas & Layer System
**Dependencies: Section 2, Section 6**
**⚠️ READ ai-instructions.md "Core Feature" section FULLY before this**
**Entirely frontend.** Backend's only role here is the ingredient schema
already built in Section 2; the rest is pure client rendering/state.

```
[x] Create src/lib/layerConfig.ts — default layer position constants
[x] Build useCustomizerStore (Zustand):
      [x] selections: Record<ingredientId, {qty, isCore}>
      [x] addItem(ingredientId, maxLimit)
      [x] removeItem(ingredientId, isCore) — blocks if core + qty would be 0
      [x] resetCustomizer()
      [x] calculateSubtotal(basePrice, ingredientsList)
      [x] calculatePrepTime(baseTime, ingredientsList)
[x] Build BurgerCanvas.tsx — fixed-size container (responsive, maintains
      aspect ratio), renders layers sorted by z_index
[x] Build IngredientLayer.tsx — single layer component, positioned via
      yPosition/widthRatio from DB, Framer Motion entry/exit animation
[x] Implement bottom_bun auto-placement logic (single type) vs user
      choice (multiple types)
[x] Implement top_bun — always z-index 10, always rendered last/on top
[x] Implement patty + cheese as CORE — is_required enforcement
[x] Implement entry animation: menu photo implode+fade → black screen →
      split layout stagger-in
[x] Implement exit animation: simple fade out (no reverse-explode)
[x] Test: layers always render in correct stacking order regardless of
      add sequence
[x] Test: burger looks proportionally correct with placeholder PNG set
[x] Test: 60fps maintained on throttled CPU (Chrome DevTools)
```

---

## SECTION 8 — Customizer Engine: Ingredient Panels & Interaction
**Dependencies: Section 7**
**Entirely frontend.**

```
[x] Build IngredientCard.tsx (left/right panel cards) — image, name, +/-
      controls or tap-to-select depending on category
[x] Build LimitBar.tsx — visual fill indicator per ingredient, fills
      toward max_limit, shake animation + lock at 100%
[x] Implement core item zero-block:
      [x] Attempt to reduce patty/cheese to 0 → blocked
      [x] Toast message shown (restaurant-defined alert text from DB
            if available, else default message)
[x] Implement max limit block:
      [x] "+" disabled at max_limit
      [x] Toast with restaurant-defined warning message
[x] Implement topping 3-tier quantity selector:
      [x] Light / Regular / Extra images per topping
      [x] Selecting one replaces previous tier (not additive)
[x] Implement sauce layering:
      [x] Same sauce tapped again → same position, zero gap, opacity blend
      [x] Different sauce → distinct layer, separate state tracking
[x] Implement left/right arrow navigation + swipe gesture support
[x] Implement core item swap (e.g. bun type change) without removing slot
[x] Build SummaryList.tsx (right panel) — live synced list with thumbnail,
      name, qty, price contribution — same Zustand store as canvas
[x] Build live price odometer animation (Framer Motion useSpring or
      AnimatePresence)
[x] Build live prep time counter (same animation style)
[x] Test: every interaction in this section reflects instantly in both
      canvas AND summary list
[x] Test: navigating back and forth preserves all selections correctly
```

---

## SECTION 9 — Customizer: Pizza & Simple-Item Canvas Variants
**Dependencies: Section 7, Section 8**
**Entirely frontend.**

```
[x] Build PizzaCanvas.tsx — top-down circular layout
      [x] Crust selection (locked/limited choice per restaurant config)
      [x] Sauce base selection
      [x] Toppings scatter radially using same 3-tier quantity system
[x] Build RollCanvas.tsx — horizontal open-wrap layout
      [x] Wrap stays visually open (no closing/rolling animation in MVP)
      [x] Sauce/topping quantity adjustment only
[x] Build SimpleItemSelector.tsx — for fries/drinks/sides
      [x] Size selector, flavor selector, no animated canvas
[x] Implement canvas_type-based routing — single customizer entry point
      dynamically renders correct canvas component
[x] Test: same Zustand store pattern and validation rules apply
      consistently across all canvas types
```

---

## SECTION 10 — With Meal Selector
**Dependencies: Section 8**

```
[x] Build MealSelector.tsx popup — triggers after "Add to Cart" if
      menu_items.with_meal = true for that item
[x] Show meal_options from DB (drink, fries, sauce, etc.)
[x] Allow meal items to also be lightly customized if restaurant enables
      it — reuses same +/- pattern
[x] "Add Meal" / "No Thanks" buttons — clear skip path
[x] If skipped, allow re-adding meal later from Cart screen
      (meal tag + edit/remove option on cart line item)
[x] Price updates live as meal options are adjusted (client estimate)
[x] Test: skipping meal does not block checkout
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
[ ] Test: itemized breakdown math is correct against server calculation
      (Section 13) — your display total must match their authoritative total
```

---

## SECTION 14 — Payment Integration (PayMob)
**Dependencies: Section 13 (backend must be done first)**

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
[ ] Test: webhook replay (same payload sent twice) does not double-create
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
      [x] Text comment field
      [x] Optional photo upload (for complaints), stored in Supabase
            Storage feedback-photos private bucket, linked to feedback row
      [x] Submits to feedback table, links order_id
[x] Test: timer persists correctly across app navigation during active
      order
[x] Test: feedback modal does not show twice for same order
```

> ✅ Resolved: feedback photo upload uses the dedicated `feedback-photos`
> private Storage bucket defined in ARCHITECTURE.md. Upload to that
> bucket, access via signed URL, matching the `feedback` table's RLS
> pattern.

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
> backend-owned — you're only building the confirmation UI and calling
> their endpoint, not deleting rows directly.

---

## Your Progress Tracker

```
[x] 3.  Auth System (UI)
[x] 5.  Home Screen
[x] 6.  Item Detail Modal
[x] 7.  Customizer Engine — Canvas & Layer System  ⚠️ CORE FEATURE
[x] 8.  Customizer Engine — Ingredient Panels & Interaction
[x] 9.  Pizza & Simple-Item Canvas Variants
[x] 10. With Meal Selector
[x] 11. Cart
[x] 12. Checkout
[x] 14. Payment Integration (UI)
[x] 15. Order Tracker & Feedback
[x] 16. Profile
--- shared with Dev 2 at the end ---
[ ] 30. SEO, AEO, GEO & Performance Pass
[ ] 31. Security Hardening Pass (joint pentest only)
[ ] 32. Final Polish & Edge Cases (joint)
```

---

## Notes

- Section 2 (Supabase schema) must be done by backend before you start
  Section 3. Coordinate with Dev 2 on this dependency.
- Section 13 (Order Placement API) must be done by backend before you
  start Section 14. Check before building payment UI.
- Sections 7-9 (Customizer Engine) are the core feature of this app —
  take extra care here. Read ai-instructions.md customizer rules every
  time before prompting for these sections.
- Full dependency map lives in final_master_checklist.md.
- Two schema gaps were resolved in ARCHITECTURE.md:
  feedback-photos Storage bucket (Section 15) and
  restock_notifications table (Section 19, Dev 2's section).
  Build against the schema as it stands in ARCHITECTURE.md.
