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
[x] Build kitchen_screens management UI in restaurant panel
      [x] "Add new screen" trigger button
      [x] List of registered screens with last_seen timestamp
      [x] Revoke/deactivate screen button
[x] Build /kitchen route — standalone, no normal auth, PIN entry screen
[x] Kitchen screen UI auto-loads and renders accepted orders only
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
[ ] Test: toggling an item's "publish" status reflects immediately on
      home screen
[ ] Test: changing is_core/is_required on an ingredient correctly
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
[ ] Test: customizing an item within a deal correctly adds extra cost
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
[ ] Peak hours chart — order volume by hour of day (missing component)
[x] Top-selling items list
[x] Most popular customizations list (e.g. "70% of burger orders add
      extra jalapeno")
[ ] Test: charts render correctly with sparse/seed data without
      breaking layout
```

---

## SECTION 23 — Restaurant Panel: Feedback Log
**Dependencies: Section 15 (Dev 1 must complete first)**

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
[ ] Delivery settings UI:
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
[ ] Test: manual "closed" toggle immediately shows closed overlay on
      user side via Realtime
```

---

## SECTION 25 — Restaurant Panel: Staff Access (RBAC)
**Dependencies: Section 3 (Dev 1 — Auth)**

```
[x] Build /restaurant/staff page
[x] Add staff account form — name, email, role (owner/manager/chef)
[x] Role-based nav hiding in the UI:
      [x] Owner — full nav
      [x] Manager — everything except staff management
      [x] Chef — KDS only, no other restaurant panel pages visible
[x] Deactivate/remove staff account button
```

> ⚠️ Important: the nav hiding above is UX only. Backend MUST enforce
> the same role matrix at the API level — never rely on hidden nav
> links as the actual security boundary.

---

## SECTION 26 — Developer Panel
**Dependencies: Section 3 (Dev 1 — Auth)**

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
**Dependencies: Section 24, Section 5 (Dev 1)**

```
[x] Render/display QR codes per table number (in Settings UI from
      Section 24)
[x] On scan — read table param from URL, auto-apply table number to
      order_type/table_number for the session
[ ] Order placed via QR flow shows "DINE-IN — Table 4" clearly on KDS (needs backend wiring)
[x] Feature toggle off hides QR entry points, falls back to manual
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
[x] Research/implement browser-based print trigger
      (window.print() targeting a formatted receipt template, or thermal
      printer SDK if a specific printer model is confirmed by restaurant)
[x] Build print-friendly KOT (Kitchen Order Ticket) template — matches
      format in ai-instructions.md / ARCHITECTURE.md examples
[x] Trigger on order Accept — only if restaurant_settings.printer_enabled
[x] Print copy count respects print_copies setting (1 = kitchen only,
      2 = kitchen + customer copy)
[ ] Test: toggling printer off completely removes any print trigger,
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
[ ] Test: marking delivered correctly triggers feedback modal on user
      side and stops the global countdown timer
```

---

## Your Progress Tracker

```
[x] 4.  Kitchen LCD PIN Security (UI)
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
