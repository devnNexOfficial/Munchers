# DEPLOYMENT.md — Muncherz
# Follow this ENTIRE checklist before every production deploy
# Skipping any step risks a production crash

---

## ⚠️ Rules Before Every Deploy

```
❌ NEVER deploy without all CI checks passing
❌ NEVER skip smoke tests
❌ NEVER manually edit production Supabase schema directly
✅ ALWAYS deploy develop → staging/preview first
✅ ALWAYS verify staging before main
✅ ALWAYS have rollback plan ready (ROLLBACK.md)
```

---

## Pre-Deploy Checklist

### Step 1 — Code Checks
```bash
npm run type-check       # TypeScript — zero errors
npm run lint              # ESLint — zero warnings
npm run test               # Vitest — all pass
npm run build               # Next.js build — zero errors
```

### Step 2 — Environment Variables Verify
```bash
# Vercel dashboard:
# - All .env variables set for Production environment
# - NEXT_PUBLIC_* variables correct public values
# - SERVER ONLY variables not exposed in client bundle
# - NODE_ENV=production set
# - SENTRY_DSN active (production only)

# Check no secrets committed
git log --oneline --all | head -20
git grep -r "PAYMOB_API_KEY=\|SUPABASE_SERVICE_ROLE_KEY=" -- '*.ts' '*.js'
# should return nothing with actual values
```

### Step 3 — Database Migration
```bash
# Test on staging first
npx supabase db push

# Verify tables + RLS policies active
npx supabase db diff

# Confirm RLS enabled on every table (see ARCHITECTURE.md list)
```

### Step 4 — Third Party Services Verify
```bash
# Supabase health
curl "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
# Expected: 200 OK

# PayMob webhook endpoint registered and reachable
# SMS/OTP provider balance/credits checked

# Free-tier risk checks (see ROLLBACK.md Section 5A and SECURITY.md
# Disaster Recovery for context — both are real constraints, not
# hypotheticals, on the Supabase free tier):
# - Confirm a health-check ping is scheduled (e.g. GitHub Actions cron)
#   so the Supabase project never goes 7 days without traffic and
#   auto-pauses
# - Confirm current Realtime concurrent-connection usage is comfortably
#   under the free-tier cap given expected KDS + tracker + kitchen LCD
#   + per-customer subscription load
```

### Step 5 — Customizer Performance Check (Critical)
```
[ ] Test customizer on a mid-range Android device — 60fps maintained
[ ] Test on slow 3G throttle — implode/fade animation still smooth
[ ] All ingredient PNGs under 200KB, transparent backgrounds confirmed
[ ] Price calculation matches between client display and server validation
[ ] Core ingredient zero-quantity block tested (patty, cheese)
[ ] Max limit shake/lock tested on at least 2 ingredients
```

---

## Deploy Steps

### Vercel (Frontend + API Routes)

```bash
# Option A — GitHub Actions auto (recommended)
git checkout main
git merge develop
git push origin main
# GitHub Actions trigger → Vercel auto-deploy

# Option B — Manual
npx vercel --prod
```

**Vercel dashboard verify:**
- Build logs: zero errors
- Environment variables all present
- Custom domain SSL active
- Function region explicitly set to the nearest available option to Pakistan
  (Mumbai, if offered for your account tier — confirm current region list
  in the Vercel dashboard, as available regions vary by plan and change
  over time) — do not leave this on a default US/EU region

### Supabase

```bash
# Migrations deployed
npx supabase db push --linked

# Realtime enabled on: orders, ingredients, restaurant_settings tables
# (see ARCHITECTURE.md — Realtime Subscriptions for what each powers)
# Storage buckets: ingredient-pngs (private), menu-images (public)
```

---

## Post-Deploy Verification (Smoke Tests)

```bash
# Health checks
curl https://yourdomain.com/api/health
# Expected: {"status":"ok"}

# Sitemap
curl https://yourdomain.com/sitemap.xml
# Expected: valid XML

# robots.txt
curl https://yourdomain.com/robots.txt
# Expected: 200 OK
```

**Manual browser checks:**
```
[ ] Home screen loads — categories, deals, search bar visible
[ ] OTP login flow — phone number → OTP → session created
[ ] Customizer opens — implode animation plays, split screen appears
[ ] Add ingredient — layer animates onto canvas, price updates
[ ] Core item zero-attempt — alert shows, blocked correctly
[ ] Max limit reached — button disables, shake animation plays
[ ] Cart → Checkout flow completes
[ ] PayMob test payment — webhook fires, order status updates
[ ] KDS receives new order in real-time (no refresh needed)
[ ] Kitchen LCD — PIN verification works, shows accepted orders only
[ ] Urdu toggle — RTL layout correct
[ ] Restaurant panel — menu item edit reflects on user side instantly
[ ] Developer panel — error log, traffic, payment status visible
```

---

## Realtime Verify

```
Supabase Dashboard → Realtime → check active subscriptions:
[ ] orders table — broadcasting on INSERT (feeds KDS) and UPDATE (feeds
      user-side order tracker)
[ ] ingredients table — broadcasting on UPDATE (feeds both customer-side
      availability sync and restaurant Inventory Control screen)
[ ] restaurant_settings table — broadcasting on UPDATE (feeds the
      "We're Closed" overlay and live hours changes)
[ ] Current connection count checked against the free-tier 200 concurrent
      connection cap — see SECURITY.md Disaster Recovery section
```

---

## Rollback Plan

If anything goes wrong, **immediately** follow ROLLBACK.md.

```bash
# Quick rollback
vercel rollback
```

---

## Checklist Sign-off

```
Deploy Date:     _______________
Deployed By:     _______________
Staging Tested:  YES / NO
Migration Run:   YES / NO / NOT NEEDED
Smoke Tests:     ALL PASS / FAILURES: ___
Customizer Perf: PASS / FAIL
Rollback Ready:  YES / NO
```

---

## Changes Made (Audit Pass)

- Translated three Roman Urdu lines (header warnings, staging-test comment, rollback-plan line) to professional English.
- **Fixed a real cross-file inconsistency:** this file's Realtime Verify section listed `orders`, `order_status`, and `inventory` as three separate channels. `ARCHITECTURE.md` listed a *different* set of four (`orders`, `order_status`, `inventory`, `kitchen_display`). `final_master_checklist.md` Section 2 listed yet a *third* set (`orders`, `restaurant_settings`, `ingredients`). None of these three documents agreed with each other, and there is no `inventory` table in the schema at all — the actual table is `ingredients`. Unified all three files to one model: Realtime is enabled on `orders` (INSERT for KDS, UPDATE for the tracker), `ingredients` (UPDATE for both customer-side availability and the restaurant Inventory screen), and `restaurant_settings` (UPDATE for the closed overlay). The standalone `kitchen_display` channel was dropped as redundant — Kitchen LCD can read from the same `orders` stream.
- Replaced the vague "close to Pakistan if available" Vercel region note with a concrete instruction to explicitly set the function region and confirm the current region list, since "if available" was doing no actual work as written.
- Added free-tier risk checks to Step 4: a scheduled health-check ping to prevent Supabase's auto-pause-after-7-days-inactivity behavior, and a reminder to check Realtime concurrent-connection usage against the free-tier cap (200 connections, confirmed current as of mid-2026). Neither of these was mentioned anywhere in the original five files, despite "free tier ONLY" being a stated non-negotiable rule in `ai-instructions.md`.
