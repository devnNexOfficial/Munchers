# backend_checklist.md — Muncherz
# Derived from final_master_checklist.md, split for a 2-person team (Frontend / Backend)
# Companion file: frontend_checklist.md — read both intros before starting

---

## How To Use This Checklist

```
This is your half of the original 32-section checklist. Each section below
lists ONLY the backend tasks (Supabase schema/RLS, API routes, server
validation, auth, payments, security, data integrity). Items tagged
🤝 JOINT need coordination with the frontend dev and appear in BOTH
files — don't duplicate the work, just sync before/after.

Some sections have NO backend tasks at all (e.g. Section 5 — Home Screen
is pure UI consuming data you already exposed in Section 2). Those are
marked clearly so you know to skip straight past them.

Workflow per section is unchanged from the original:
  1. Reference ai-instructions.md + .cursorrules in your AI editor prompt
     — especially the price-validation and security sections
  2. Pull the exact items below for the section you're working on
  3. Cross-check ARCHITECTURE.md for the authoritative schema before
     writing migrations
  4. Run: npm run type-check && npm run lint && npm run build
  5. Commit with conventional commit message
  6. Move to next section — respect the original dependency order
     (full dependency map lives in final_master_checklist.md)
```

---

## SECTION 1 — Project Setup & Foundation
**Dependencies: None — start here**
**Mostly your section. Your pieces:**

```
[ ] Initialize Next.js 15 project (App Router, TypeScript strict)
[ ] Configure tsconfig.json — strict: true, no implicit any
[ ] Configure ESLint + Prettier with import order rule
[ ] Set up Husky pre-commit hooks (type-check, lint)
[ ] Configure next.config.js — security headers, image domains
[ ] Initialize Git repo, create develop branch, push initial commit
[ ] Set up GitHub Actions CI workflow (type-check, lint, build on PR)
```

**🤝 JOINT (coordinate with frontend dev, don't duplicate):**
```
[ ] Install core dependencies: tailwindcss, framer-motion, zustand, zod
[ ] Create folder structure exactly as defined in README.md
[ ] Set up .env.example and .env.local (gitignored)
[ ] Verify npm run dev starts clean with zero console errors/warnings
```

---

## SECTION 2 — Supabase Setup & Database Schema
**Dependencies: Section 1**
**Entirely backend-owned.** No frontend tasks in this section — they'll
import the browser client you set up here, nothing more.

```
[ ] Create Supabase project
[ ] Install @supabase/supabase-js and @supabase/ssr
[ ] Set up Supabase client (browser + server variants) in src/lib/supabase/
[ ] Create all tables from ARCHITECTURE.md schema:
      [ ] profiles
      [ ] addresses
      [ ] categories
      [ ] menu_items
      [ ] ingredients
      [ ] menu_item_ingredients
      [ ] orders
      [ ] order_items
      [ ] saved_creations
      [ ] feedback
      [ ] deals
      [ ] riders
      [ ] kitchen_screens
      [ ] restaurant_settings
      [ ] staff_accounts
      [ ] activity_logs
[ ] Add all indexes listed in ARCHITECTURE.md performance section
[ ] Enable RLS on every table — no exceptions
[ ] Write RLS policies:
      [ ] profiles — user can only read/update own row
      [ ] orders — user can only read own orders; restaurant role can
            read/update all
      [ ] addresses — user can only access own addresses
      [ ] saved_creations — user can only access own
      [ ] feedback — user can create own, restaurant can read all + reply
      [ ] menu_items / ingredients — public read, restaurant-role write only
      [ ] activity_logs — insert only, no update/delete for anyone
[ ] Enable Realtime on: orders (INSERT for KDS, UPDATE for the user
      tracker), ingredients (UPDATE for availability sync), and
      restaurant_settings (UPDATE for the closed overlay)
[ ] Create Storage buckets:
      [ ] menu-images (public)
      [ ] ingredient-pngs (private, signed URL access)
      [ ] ⚠️ ADD: a feedback-photos bucket — Section 15 (Order Tracker
            & Feedback) needs one and it isn't listed anywhere in the
            original schema docs. Decide policy (private, linked to
            feedback row) before frontend builds the upload UI.
[ ] Seed initial restaurant_settings row (Muncherz defaults)
[ ] Test connection from Next.js app — simple query succeeds
```

---

## SECTION 3 — Auth System (User + Restaurant + Developer)
**Dependencies: Section 2**

```
[ ] Configure Supabase Auth — Phone OTP provider enabled
[ ] Build OTP send API route — POST /api/auth/send-otp
      [ ] Zod validation on phone number format (Pakistan format)
      [ ] Rate limit: 3 sends per phone per 10 minutes
[ ] Build OTP verify API route — POST /api/auth/verify-otp
      [ ] Creates/updates profiles row on first verify
      [ ] Sets httpOnly JWT cookie session
[ ] Role check against staff_accounts table on every protected request
[ ] 2FA setup flow for developer accounts (QR code generation, TOTP
      verification) — MUST be enrolled per-user (use Supabase Auth's
      native MFA factor enrollment), not a single shared secret for all
      developer accounts — see SECURITY.md
[ ] Middleware: protect /restaurant/* routes — staff role required
[ ] Middleware: protect /developer/* routes — developer role + 2FA required
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
[ ] Generate unique PIN on kitchen screen creation
[ ] Hash PIN before storing (never plain text)
[ ] Revoke/deactivate screen — API logic
[ ] Build PIN verify API — POST /api/kitchen/verify-pin
      [ ] 3 wrong attempts → lockout + alert to restaurant owner
      [ ] On success — device gets long-lived session token (until revoked)
[ ] Ensure API/realtime stream only ever sends accepted orders to the
      kitchen screen (never pending/rejected)
[ ] Test: wrong PIN 3 times locks out correctly
```

**🤝 JOINT:**
```
[ ] Test: revoking a screen from restaurant panel immediately blocks it
```

---

## SECTION 5 — Home Screen (User Panel)
**No backend tasks.** This is pure UI consuming the tables/RLS you already
built in Section 2 — no new API routes needed for the MVP (client reads
directly via the Supabase client + RLS).

---

## SECTION 6 — Item Detail Modal (Pre-Customize)
**No backend tasks.** Same as above — consumes existing data only.

---

## SECTION 7 — Customizer Engine: Canvas & Layer System
**No backend tasks.** This is pure client-side rendering/state. Your
customizer-related work lives in Section 2 (ingredient schema, already
done) and Section 13 (server-side price re-validation, coming up).

---

## SECTION 8 — Customizer Engine: Ingredient Panels & Interaction
**No backend tasks.** Same as Section 7.

---

## SECTION 9 — Customizer: Pizza & Simple-Item Canvas Variants
**No backend tasks.** Same as Section 7.

---

## SECTION 10 — With Meal Selector
**Dependencies: Section 8**
**No build tasks** beyond what Section 13 already requires you to do.

**🤝 JOINT:**
```
[ ] Test: meal price correctly added to order total server-side
      (verify your Section 13 order API actually includes meal pricing)
```

---

## SECTION 11 — Cart
**No backend tasks.** Cart is entirely client-side state until checkout;
your work begins again at Section 13.

---

## SECTION 12 — Checkout
**No new backend build tasks** — checkout reuses your Section 3 (OTP
re-verify) and Section 2 (settings/RLS) work as-is.

**🤝 JOINT:**
```
[ ] Test: itemized breakdown math is correct against server calculation
      (your Section 13 total is the source of truth — confirm frontend's
      display matches it)
```

---

## SECTION 13 — Order Placement API (Server-Side Validation)
**Dependencies: Section 12, Section 2**
**⚠️ This is a critical security section — review against ai-instructions.md**
**Entirely backend-owned.**

```
[ ] Build POST /api/orders/place
      [ ] Zod schema validates entire payload shape
      [ ] Server re-fetches ALL ingredient/item prices from Supabase —
            never trusts client-sent prices
      [ ] Server recalculates subtotal, GST, delivery charge, total
            independently
      [ ] If client total != server total → reject order, log to
            activity_logs as suspicious, return generic error to client
      [ ] Validates minimum order amount server-side too
      [ ] Validates delivery radius server-side too
      [ ] Generates unique order_number (e.g. ORD-1042, sequential or
            timestamp-based)
      [ ] Generates payment_intent_id for idempotency
      [ ] Inserts into orders + order_items tables atomically (use a
            Supabase transaction/RPC function)
      [ ] Calculates complexity flag (green/yellow/red) based on
            customization count and rules in ai-instructions.md
      [ ] If COD — order status set to 'pending', awaits restaurant accept
      [ ] If online payment — redirects to payment initiation flow first,
            order created only after payment confirms (or held in a
            pending-payment state)
[ ] Build rate limiting middleware — 10 orders per user per hour
[ ] Build 60-second grace cancel window:
      [ ] Cancel only allowed while order status = 'pending'
            (before restaurant accepts)
      [ ] Once restaurant accepts → cancel endpoint rejects immediately,
            regardless of elapsed time
[ ] Test: tampering client-side price in browser dev tools results in
      order rejection
[ ] Test: order placed twice rapidly with same payment_intent_id does
      not create duplicate orders
```

---

## SECTION 14 — Payment Integration (PayMob)
**Dependencies: Section 13**

```
[ ] Set up PayMob account + sandbox credentials
[ ] Build POST /api/payment/initiate
      [ ] Creates PayMob payment intent for the order total
      [ ] Returns redirect/iframe URL for JazzCash/Easypaisa/Card flow
[ ] Build POST /api/payment/webhook
      [ ] Verifies HMAC signature against PAYMOB_HMAC_SECRET
      [ ] Idempotent — checks payment_intent_id before processing,
            ignores duplicate webhook deliveries
      [ ] Updates order payment_status and status on success
      [ ] On failure — order status updated, user notified, retry option
            shown (up to 3 attempts before auto-cancel)
[ ] Build POST /api/payment/refund/:id — for cancellations after payment
[ ] Background order-status check endpoint — confirms order status from
      server regardless of local network interruption on the client
[ ] Test: webhook replay (same payload sent twice) does not double-create
      or double-process
```

---

## SECTION 15 — Order Tracker & Feedback
**Dependencies: Section 13**
**Minimal backend work** — Realtime is already enabled (Section 2), and
the feedback insert mostly relies on RLS you already wrote.

```
[ ] Confirm feedback-photos Storage bucket exists with correct policy
      (flagged in Section 2 — add it now if not already done)
[ ] Confirm RLS on feedback table correctly links inserts to order_id
      and restricts writes to the order's own user
```

---

## SECTION 16 — Profile (Saved Creations, Addresses, Stamps)
**Dependencies: Section 3, Section 11**
**Mostly covered by Section 2's RLS. One real build item:**

```
[ ] Build account deletion/anonymization endpoint — legal requirement.
      Don't rely on a plain client-side RLS delete; this needs a
      controlled server process that properly removes/anonymizes
      personal data per the privacy policy (orders/history likely need
      anonymizing rather than deleting, for financial record purposes)
```

---

## SECTION 17 — Restaurant Panel: Live KDS
**Dependencies: Section 13, Section 3**

```
[ ] Order status-update API/RPC for Accept → Preparing transition
[ ] Order status-update API/RPC for Reject → stores reason, notifies user
[ ] Order status-update API/RPC for Ready → triggers rider
      notification/assignment flow
[ ] Ensure the cancel endpoint (Section 13) actually rejects cancellation
      once an order has been accepted — this is the real enforcement,
      not just hiding the cancel button on the frontend
```

**🤝 JOINT:**
```
[ ] Test: order accept correctly removes cancel ability on user side
      in real-time (you confirm the cancel endpoint rejects it; frontend
      confirms the UI updates)
```

---

## SECTION 18 — Restaurant Panel: Menu Manager
**Dependencies: Section 2, Section 3**

```
[ ] Menu item CRUD API with server-side validation (Zod) for all fields
[ ] Image upload validation (type + size) enforced server-side for
      menu images
[ ] Ingredient assignment writes (menu_item_ingredients) — validate
      is_core/is_required/is_flexible/default_qty/max_qty server-side
[ ] Global ingredients CRUD API
[ ] Enforce that restaurant-role API requests CANNOT write the
      developer-controlled PNG/position fields (png_image_url, qty tier
      images, z_index, yPosition, widthRatio) — only developer/seed
      scripts should be able to touch these
[ ] Test: changing is_core/is_required on an ingredient correctly
      changes customizer validation behavior on next load (confirm the
      API actually returns the updated flag)
```

---

## SECTION 19 — Restaurant Panel: Inventory Control
**Dependencies: Section 18**

```
[ ] Toggle/stock-count update API
[ ] Auto sold-out logic:
      [ ] If stock_count reaches 0 → is_available auto-set to false
            (DB trigger or server function)
      [ ] Low stock alert (low_stock_alert threshold) — surfaced to
            restaurant panel dashboard
[ ] Menu item "Sold Out" toggle API
[ ] "Notify Me" backend mechanism — ⚠️ FLAG: there's no table or design
      for this in the current schema. Decide the approach (new
      `restock_notifications` table? push/email trigger on
      is_available flip?) before frontend builds the bell UI
```

---

## SECTION 20 — Restaurant Panel: Deals Manager
**Dependencies: Section 18**

```
[ ] Deal data CRUD API (pre-made deals + Build Your Own Deal config)
[ ] Deal pricing logic feeding into the order placement API (Section 13)
      so customizing within a deal calculates extra cost correctly
      server-side
```

**🤝 JOINT:**
```
[ ] Test: customizing an item within a deal correctly adds extra cost
      on top of deal base price when limits are exceeded — confirm your
      server total matches what frontend displays
```

---

## SECTION 21 — Restaurant Panel: Orders History & Financials
**Dependencies: Section 17**

```
[ ] Aggregation queries/API for financial breakdown (COD vs JazzCash vs
      Easypaisa vs Card totals, total revenue, average order value,
      cancelled orders with reasons)
[ ] COD pending-confirmation flag logic (rider hasn't confirmed cash
      collected yet)
[ ] Daily sales log aggregation (date, total orders, total revenue,
      top-selling item, busiest area)
[ ] Confirm tax invoice data (GST breakdown) is correctly stored and
      retrievable per order
[ ] Test: financial totals match sum of individual order totals exactly
```

---

## SECTION 22 — Restaurant Panel: Analytics
**Dependencies: Section 21**

```
[ ] Live revenue counter query (today)
[ ] Order volume aggregation query (daily/weekly trend)
[ ] Geographic heatmap query — orders grouped by delivery area from
      address lat/long data
[ ] Peak hours aggregation query (order volume by hour of day)
[ ] Top-selling items query
[ ] Most popular customizations query — aggregating across order_items;
      this one is non-trivial given how customizations are likely stored
      as JSON/structured data — plan the query approach early
```

---

## SECTION 23 — Restaurant Panel: Feedback Log
**Dependencies: Section 15**

```
[ ] RLS policy allowing restaurant role to write owner_reply and
      resolved/unresolved fields on the feedback table
[ ] Confirm order_items stores a true snapshot of what was ordered
      (name/price/qty at order time), not a live join to current
      menu_items — this is what makes the "Customization Blueprint"
      reliable after menu changes
[ ] Test: blueprint view accurately reflects the exact customization
      that was ordered, not the current menu defaults
```

---

## SECTION 24 — Restaurant Panel: Delivery & Settings
**Dependencies: Section 2**

```
[ ] Settings save API — restaurant-role write only (RLS already covers
      read/write boundary from Section 2, confirm here)
[ ] Server-side validation: at least one payment method must remain
      enabled — reject the save otherwise with a clear error
[ ] Test: disabling all payment methods except one is allowed; attempting
      to disable the last one is blocked
```

---

## SECTION 25 — Restaurant Panel: Staff Access (RBAC)
**Dependencies: Section 3**

```
[ ] staff_accounts CRUD API
[ ] Role permission matrix enforced at the API level for every
      protected route — this is the real security boundary, the
      frontend's nav hiding is UX only and must not be trusted
[ ] Deactivate/remove staff account endpoint
[ ] Extend the /restaurant/* middleware so chef-role accounts are
      blocked from any non-KDS route, even via direct URL
[ ] Test: chef-role login redirects away from any non-KDS restaurant
      panel route attempted directly via URL
```

---

## SECTION 26 — Developer Panel
**Dependencies: Section 3**

```
[ ] Build GET /api/health endpoint
[ ] Active-session/connection counting logic for the live users counter
[ ] Error log integration — Sentry or a lightweight error table, with
      severity/route/time-range filtering support
[ ] Payment success rate aggregation endpoint
[ ] Database status endpoint — connection health, query latency sample
[ ] Activity log query endpoint (activity_logs table) — security-relevant
      events (price mismatch attempts, failed kitchen PIN attempts, role
      access denials)
[ ] Test: dashboard data is inaccessible without a valid 2FA session
```

---

## SECTION 27 — QR Code Dine-In Flow
**Dependencies: Section 24, Section 5**

```
[ ] Decide/implement the table URL scheme (e.g. ?table=4) and QR
      generation approach
[ ] Ensure table_number persists correctly through the order placement
      API (Section 13) and onto the resulting KDS order record
```

**🤝 JOINT:**
```
[ ] Test: scanning QR and placing order correctly tags table number
      end-to-end through to KDS
```

---

## SECTION 28 — Printer Integration (Optional Toggle)
**No backend tasks.** This feature is entirely browser-based
(window.print()); your only involvement is the printer_enabled and
print_copies settings, already covered in Section 24.

---

## SECTION 29 — Rider Management
**Dependencies: Section 17**

```
[ ] riders table CRUD API
[ ] Rider assignment write logic (order.rider_id, status update) when
      assigned from the KDS Ready column
[ ] Rider authentication/access scoping — riders should only be able to
      see their own assigned order, never anyone else's. This needs its
      own design (lightweight token? phone-based session?) since riders
      aren't covered by the existing profiles/staff_accounts auth model
[ ] "Mark Delivered" + COD confirmation API — updates order status and
      payment_status
[ ] Confirm the COD-pending flag surfaces correctly in Financials
      (Section 21) when a rider hasn't confirmed collection yet
```

---

## SECTION 30 — SEO, AEO, GEO & Performance Pass
**No backend-specific tasks.** This section is entirely frontend
(metadata, structured data, sitemap, Lighthouse). Only coordinate here
if your API response times are affecting the frontend's performance
budget (< 200ms API response target from README.md).

---

## SECTION 31 — Security Hardening Pass
**Dependencies: All sections involving user input or money**
**Entirely backend-owned** (audit/hardening of work you already built).

```
[ ] Confirm RLS active and correctly scoped on every single table —
      re-audit against ARCHITECTURE.md list
[ ] Confirm every API route has Zod validation on its input
[ ] Confirm every price-affecting endpoint re-validates server-side
      (orders, deals)
[ ] Confirm rate limiting active on: OTP send, order placement, payment
      initiation, kitchen PIN attempts
[ ] Confirm security headers set in next.config.js (X-Frame-Options,
      X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP)
[ ] Confirm no secrets present anywhere in client-side bundle
      (search build output for any leaked SERVER ONLY env values)
[ ] Confirm activity_logs correctly capturing: price mismatch attempts,
      failed kitchen PIN attempts, role access denials, manual price/
      settings changes by staff
[ ] Confirm file upload validation (type + size) enforced server-side
      for menu images and feedback photos
[ ] Confirm kitchen LCD device lockout and revocation working correctly
[ ] Confirm 2FA enforced on developer panel with no bypass path, and
      confirmed enrolled per-user (not a single shared TOTP secret
      across all developer accounts)
[ ] Document any findings and fix before production deploy
```

**🤝 JOINT (run together with frontend dev):**
```
[ ] Attempt to alter price via browser dev tools network tab
[ ] Attempt to access /restaurant/* without staff session
[ ] Attempt to access /developer/* without 2FA session
[ ] Attempt kitchen PIN brute force (should lock after 3)
[ ] Attempt duplicate payment webhook replay
```

---

## SECTION 32 — Final Polish & Edge Cases
**Dependencies: All previous sections**

```
[ ] Ensure all API error responses are sanitized — never return raw
      error codes/stack traces to the client, even on internal failures
[ ] Confirm the order-status-check endpoint (Section 14) properly
      supports the "recover regardless of network interruption" flow
      the frontend builds on top of it
```

**🤝 JOINT:**
```
[ ] Final full end-to-end order flow test — browse → customize → meal →
      cart → checkout → payment → KDS → kitchen LCD → ready → rider →
      delivered → feedback, with every toggle (printer, QR, GST, surge,
      loyalty) tested both ON and OFF
```

---

## Your Progress Tracker

```
[ ] 1.  Project Setup & Foundation (your pieces)
[ ] 2.  Supabase Setup & Database Schema
[ ] 3.  Auth System (server-side)
[ ] 4.  Kitchen LCD PIN Security (server-side)
[ ] 5.  Home Screen — N/A, no backend tasks
[ ] 6.  Item Detail Modal — N/A, no backend tasks
[ ] 7.  Customizer Engine — Canvas & Layer System — N/A
[ ] 8.  Customizer Engine — Ingredient Panels & Interaction — N/A
[ ] 9.  Pizza & Simple-Item Canvas Variants — N/A
[ ] 10. With Meal Selector — joint test only
[ ] 11. Cart — N/A, no backend tasks
[ ] 12. Checkout — joint test only
[ ] 13. Order Placement API
[ ] 14. Payment Integration (PayMob)
[ ] 15. Order Tracker & Feedback (minimal)
[ ] 16. Profile — account deletion endpoint
[ ] 17. Restaurant Panel — Live KDS (server-side)
[ ] 18. Restaurant Panel — Menu Manager (server-side)
[ ] 19. Restaurant Panel — Inventory Control (server-side)
[ ] 20. Restaurant Panel — Deals Manager (server-side)
[ ] 21. Restaurant Panel — Orders & Financials (server-side)
[ ] 22. Restaurant Panel — Analytics (server-side)
[ ] 23. Restaurant Panel — Feedback Log (server-side)
[ ] 24. Restaurant Panel — Delivery & Settings (server-side)
[ ] 25. Restaurant Panel — Staff Access (server-side)
[ ] 26. Developer Panel (server-side)
[ ] 27. QR Code Dine-In Flow (server-side)
[ ] 28. Printer Integration — N/A, no backend tasks
[ ] 29. Rider Management (server-side)
[ ] 30. SEO, AEO, GEO & Performance Pass — N/A
[ ] 31. Security Hardening Pass
[ ] 32. Final Polish & Edge Cases
```

---

## Notes On This Split

- Full original section dependency map and detailed item ordering still
  live in `final_master_checklist.md` — this file only re-sorts items by
  who builds them, it doesn't change the dependency order.
- Three real gaps surfaced while splitting, flagged inline above too:
    1. No Storage bucket defined for feedback photos (needed by Section 15).
    2. The "Notify Me" ingredient-restock feature (Section 19) has no
       backing table or mechanism in the current schema.
    3. Rider authentication/access scoping (Section 29) was never
       designed — riders aren't covered by the existing
       profiles/staff_accounts auth model and need their own approach.
  None of these block earlier sections, but flag them with the team
  before Sections 15, 19, and 29 respectively.
- Anywhere a section had zero backend tasks (Sections 5, 6, 7, 8, 9, 11,
  28, 30), it's called out explicitly so you don't go looking for work
  that isn't yours.
