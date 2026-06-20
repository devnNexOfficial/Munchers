# checklist_dev2.md — Muncherz
# DEVELOPER 2 — Admin Panels (Restaurant & Operations)
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
# YOUR SECTIONS: 4, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29
# SHARED AT END (with Dev 1): 30, 31, 32
# NOT YOUR SECTIONS: 1 (done), 2 (backend), 3 (Dev 1),
#   5-16 (Dev 1), 13 (backend)
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
# Accents/badges/status = muncherz-yellow (#F7B731)
# Customizer canvas ONLY = muncherz-black (#0A0A0A)
# NO dark theme (#121212, #111111, bg-gray-900) anywhere —
# restaurant panel is also white/light, not a dark SaaS dashboard
# ============================================================

---

## How To Use This Checklist

```
This is your half of the frontend checklist. Each section lists
ONLY your UI tasks (components, animations, client state, pages).
Items tagged 🤝 JOINT need coordination with the backend dev or
Dev 1 — don't duplicate the work, just sync before/after.

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

## SECTION 4 — Kitchen LCD PIN Security
**Dependencies: Section 2 (backend), Section 3 (Dev 1 — Auth)**

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

## SECTION 17 — Restaurant Panel: Live KDS
**Dependencies: Section 13 (backend), Section 3 (Dev 1 — Auth)**

```
[ ] Build /restaurant/kds page — three columns: Pending / Preparing / Ready
[ ] Realtime subscription — new orders appear instantly, no refresh
[ ] Order card displays (per ai-instructions.md format):
      [ ] Order number, type (delivery/dine-in/takeaway), table if dine-in
      [ ] Full ingredient breakdown grouped clearly (core items, then
            sauce flavors with quantity multiplier e.g. "2x")
      [ ] Cooking preference if applicable
      [ ] Meal additions if any
      [ ] Special instructions
      [ ] Complexity flag (green/yellow/red) with corresponding color
      [ ] Live countdown timer per order
      [ ] Payment method + status indicator
[ ] Accept button (calls backend status-update endpoint) — moves order to
      Preparing, starts timer
[ ] Reject button — requires reason selection (out of stock / closing
      soon / too busy / other), calls backend endpoint
[ ] Ready button — moves to Ready column, triggers rider
      notification/assignment flow (calls backend endpoint)
[ ] Order grouping/sorting helper — groups similar core ingredients
      across multiple simultaneous orders for kitchen efficiency display
[ ] Printer trigger — calls print on Accept if printer_enabled
[ ] Test: multiple simultaneous orders display correctly without
      overlap/lag
```

**🤝 JOINT:**
```
[ ] Test: order accept correctly removes cancel ability on user side
      in real-time (you verify the UI updates; backend verifies the
      cancel endpoint actually rejects it)
```

---

## SECTION 18 — Restaurant Panel: Menu Manager
**Dependencies: Section 2, Section 3**

```
[ ] Build /restaurant/menu page — list of all menu_items, grouped by
      category
[ ] Add/Edit menu item form:
      [ ] Name (EN + UR), description (EN + UR), category select
      [ ] Image upload (standard photo, public bucket)
      [ ] Base price, discount price toggle + value
      [ ] Size variants editor (add/remove S/M/L with individual pricing)
      [ ] Canvas type select (burger/pizza/roll/simple)
      [ ] Best Seller / Chef's Pick badge toggles
      [ ] With Meal toggle + meal options config
      [ ] Daily special toggle + countdown end time
      [ ] Publish/hide toggle
[ ] Ingredient assignment per item UI (menu_item_ingredients):
      [ ] Select from global ingredients list
      [ ] Mark is_core, is_required, is_flexible per assignment
      [ ] Set default_qty, max_qty per assignment
      [ ] Reorder sort_order (drag or up/down)
[ ] Global Ingredients manager UI:
      [ ] Add/edit ingredient — name (EN+UR), category, price_per_unit,
            standard_unit, max_limit, stock_count
      [ ] PNG image fields (png_image_url, qty tier images, z_index,
            yPosition, widthRatio) shown read-only — restaurant UI does
            NOT expose these for editing
[ ] Test: toggling an item's "publish" status reflects immediately on
      home screen
[ ] Test: changing is_core/is_required on an ingredient correctly
      changes customizer validation behavior on next load
```

---

## SECTION 19 — Restaurant Panel: Inventory Control
**Dependencies: Section 18**

```
[ ] Build /restaurant/inventory page
[ ] List all ingredients with current is_available toggle
[ ] Stock count input (optional — null means unlimited)
[ ] Toggling OFF an ingredient — UI side:
      [ ] Instantly reflects on user side via Realtime — ingredient
            shows grayscale + lock icon + "Currently Unavailable"
      [ ] Customize/Add button disabled for affected combos
      [ ] "Notify Me" bell option available to user for that ingredient
[ ] Whole menu item out-of-stock UI:
      [ ] Manual "Sold Out" toggle on menu item itself
      [ ] Shows "Sold Out" badge on user side, item not orderable
[ ] Test: toggling ingredient off mid-customization for another active
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
[ ] Build /restaurant/deals page
[ ] Pre-made deal builder UI:
      [ ] Name (EN+UR), image, deal price, original price (for
            crossed-out display)
      [ ] Select included items (e.g. 2x Burger + 1x Fries + 2x Drink)
      [ ] Per-item customization limit config UI
      [ ] Active/inactive toggle, valid date range
[ ] "Build Your Own Deal" config UI:
      [ ] Define slots (Main/Side/Drink), eligible items per slot,
            combined discounted price logic display
[ ] Deal display on home screen — Hot Deals tab pulls from this data
[ ] Customize Deal flow — reuses same customizer engine per sub-item
      within the deal context, tracks combined price correctly (display)
```

**🤝 JOINT:**
```
[ ] Test: customizing an item within a deal correctly adds extra cost
      on top of deal base price when limits are exceeded (you display
      it; backend's order API must calculate it correctly)
```

---

## SECTION 21 — Restaurant Panel: Orders History & Financials
**Dependencies: Section 17**

```
[ ] Build /restaurant/orders page
[ ] Daily/weekly/monthly order list with filters (date range, status,
      order type) — UI
[ ] Financial breakdown display:
      [ ] COD vs JazzCash vs Easypaisa vs Card totals
      [ ] Total revenue, average order value
      [ ] Cancelled orders list with reasons
      [ ] COD pending confirmation flag display
[ ] Daily sales log display — date, total orders, total revenue,
      top-selling item, busiest area
[ ] Tax invoice/receipt view per order — matches order_number shown to
      user, includes GST breakdown if enabled
```

---

## SECTION 22 — Restaurant Panel: Analytics
**Dependencies: Section 21**

```
[ ] Build /restaurant/analytics page
[ ] Live revenue counter (today) — display
[ ] Order volume chart (daily/weekly trend)
[ ] Geographic heatmap — orders grouped by delivery area
[ ] Peak hours chart — order volume by hour of day
[ ] Top-selling items list
[ ] Most popular customizations list (e.g. "70% of burger orders add
      extra jalapeno")
[ ] Test: charts render correctly with sparse/seed data without
      breaking layout
```

---

## SECTION 23 — Restaurant Panel: Feedback Log
**Dependencies: Section 15 (Dev 1 must complete first)**

```
[ ] Build /restaurant/feedback page
[ ] List all feedback — star rating, comment, photo (if attached),
      linked order
[ ] "View Customization Blueprint" button — shows exact ingredients/
      quantities from that order's order_items
[ ] Owner reply input field
[ ] 1-2 star reviews trigger a red alert/highlight in the list
[ ] Resolved/unresolved toggle for complaint tracking
```

---

## SECTION 24 — Restaurant Panel: Delivery & Settings
**Dependencies: Section 2**

```
[ ] Build /restaurant/settings page — maps to restaurant_settings table
[ ] Working hours — open_time, close_time, manual closed override toggle
[ ] Delivery settings UI:
      [ ] Free delivery radius (km)
      [ ] Flat/distance-based delivery charge
      [ ] Max delivery radius
      [ ] Surge pricing toggle + time window + surge charge amount
[ ] Minimum order amount field
[ ] Prep time buffer field
[ ] Payment methods toggles — COD/JazzCash/Easypaisa/Card
[ ] Loyalty program toggle + stamp count + reward item config
[ ] QR dine-in toggle — when enabled, generates/displays QR codes per
      table number for printing
[ ] Printer toggle + copy count (1 or 2)
[ ] Kitchen LCD toggle (master on/off for the whole feature)
[ ] GST toggle + percentage field
[ ] Urdu language toggle (master on/off for the feature across app)
[ ] Test: manual "closed" toggle immediately shows closed overlay on
      user side via Realtime
```

---

## SECTION 25 — Restaurant Panel: Staff Access (RBAC)
**Dependencies: Section 3 (Dev 1 — Auth)**

```
[ ] Build /restaurant/staff page
[ ] Add staff account form — name, email, role (owner/manager/chef)
[ ] Role-based nav hiding in the UI:
      [ ] Owner — full nav
      [ ] Manager — everything except staff management
      [ ] Chef — KDS only, no other restaurant panel pages visible
[ ] Deactivate/remove staff account button
```

> ⚠️ Important: the nav hiding above is UX only. Backend MUST enforce
> the same role matrix at the API level — never rely on hidden nav
> links as the actual security boundary.

---

## SECTION 26 — Developer Panel
**Dependencies: Section 3 (Dev 1 — Auth)**

```
[ ] Build /developer/dashboard page shell
[ ] App health indicator display (green/red)
[ ] Live active users counter display
[ ] Error log viewer UI — filterable by severity, route, time range
[ ] Payment success rate widget display
[ ] Database status widget display
[ ] Activity log viewer UI (from activity_logs table)
```

---

## SECTION 27 — QR Code Dine-In Flow
**Dependencies: Section 24, Section 5 (Dev 1)**

```
[ ] Render/display QR codes per table number (in Settings UI from
      Section 24)
[ ] On scan — read table param from URL, auto-apply table number to
      order_type/table_number for the session
[ ] Order placed via QR flow shows "DINE-IN — Table 4" clearly on KDS
[ ] Feature toggle off hides QR entry points, falls back to manual
      order type selection
```

**🤝 JOINT:**
```
[ ] Test: scanning QR and placing order correctly tags table number
      end-to-end through to KDS
```

---

## SECTION 28 — Printer Integration (Optional Toggle)
**Dependencies: Section 17, Section 24**
**Entirely frontend** — backend's only involvement is the
printer_enabled/print_copies settings, already covered in Section 24.

```
[ ] Research/implement browser-based print trigger
      (window.print() targeting a formatted receipt template, or thermal
      printer SDK if a specific printer model is confirmed by restaurant)
[ ] Build print-friendly KOT (Kitchen Order Ticket) template — matches
      format in ai-instructions.md / ARCHITECTURE.md examples
[ ] Trigger on order Accept — only if restaurant_settings.printer_enabled
[ ] Print copy count respects print_copies setting (1 = kitchen only,
      2 = kitchen + customer copy)
[ ] Test: toggling printer off completely removes any print trigger,
      no errors thrown
```

---

## SECTION 29 — Rider Management
**Dependencies: Section 17**

```
[ ] Build riders management UI in restaurant panel
[ ] Add/edit/deactivate rider forms — name, phone, active/available status
[ ] "Assign rider" button on KDS Ready column
[ ] Lightweight rider-facing web view:
      [ ] Shows assigned order — customer phone, delivery address/map
            link, order number
      [ ] "Mark Delivered" button
      [ ] COD confirmation checkbox ("Payment collected")
[ ] Test: marking delivered correctly triggers feedback modal on user
      side and stops the global countdown timer
```

---

## Your Progress Tracker

```
[ ] 4.  Kitchen LCD PIN Security (UI)
[ ] 17. Restaurant Panel — Live KDS (UI)
[ ] 18. Restaurant Panel — Menu Manager (UI)
[ ] 19. Restaurant Panel — Inventory Control (UI)
[ ] 20. Restaurant Panel — Deals Manager (UI)
[ ] 21. Restaurant Panel — Orders & Financials (UI)
[ ] 22. Restaurant Panel — Analytics (UI)
[ ] 23. Restaurant Panel — Feedback Log (UI)
[ ] 24. Restaurant Panel — Delivery & Settings (UI)
[ ] 25. Restaurant Panel — Staff Access (UI)
[ ] 26. Developer Panel (UI)
[ ] 27. QR Code Dine-In Flow
[ ] 28. Printer Integration
[ ] 29. Rider Management
--- shared with Dev 1 at the end ---
[ ] 30. SEO, AEO, GEO & Performance Pass
[ ] 31. Security Hardening Pass (joint pentest only)
[ ] 32. Final Polish & Edge Cases (joint)
```

---

## Notes

- Section 3 (Auth) must be completed by Dev 1 before you start
  Section 4, 25, or 26. Coordinate on auth dependencies.
- Section 13 (Order Placement API) must be done by backend before
  you start Section 17. Check before building KDS.
- Section 15 (Order Tracker) must be done by Dev 1 before you start
  Section 23 (Feedback Log). Coordinate on this dependency.
- Section 5 (Home Screen) must be done by Dev 1 before you start
  Section 27 (QR Flow). Coordinate on this dependency.
- Full dependency map lives in final_master_checklist.md.
- Two schema gaps were resolved in ARCHITECTURE.md:
  feedback-photos Storage bucket (Dev 1 Section 15) and
  restock_notifications table (your Section 19).
  Build against the schema as it stands in ARCHITECTURE.md.
- Restaurant panel is white/light themed — NOT a dark dashboard.
  Same white base (#FAFAFA) as the user panel, red/yellow accents.
