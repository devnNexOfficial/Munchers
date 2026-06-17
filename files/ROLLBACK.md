# ROLLBACK.md — Muncherz
# Emergency rollback procedure
# If anything breaks in production → open this file

---

## ⚡ 30-Second Decision Tree

```
Did something break in production?
        ↓
Is the issue limited to UI/Frontend?
  YES → Vercel 1-click rollback (Section 1)
  NO  ↓
Is the issue an API route?
  YES → Vercel rollback (same deployment, Section 1)
  NO  ↓
Is the issue database/migration related?
  YES → DB migration revert (Section 2) ← CAREFUL
  NO  ↓
Is the issue with the payment webhook?
  YES → PayMob webhook check (Section 3)
  NO  ↓
Is the issue an environment variable?
  YES → Fix in Vercel dashboard (Section 4)
  NO  ↓
Is the issue customizer animation/performance?
  YES → Customizer-specific rollback (Section 5)
  NO  ↓
Is the entire site unreachable (not just one feature)?
  YES → Check Supabase project status first (Section 5A) — free-tier
         projects auto-pause after ~7 days without API traffic
```

---

## Section 1 — Vercel Rollback

**Time: ~60 seconds**

```bash
# Option A — CLI (fastest)
npx vercel rollback

# Option B — Dashboard
# vercel.com → Project → Deployments
# Previous successful deploy → "..." menu → "Promote to Production"
```

**Verify:**
```bash
curl https://yourdomain.com/api/health
# Expected: 200 OK
```

---

## Section 2 — Database Migration Revert

**⚠️ CAREFUL — data loss risk. Inform team immediately first.**

```bash
# Step 1: Check migration status
npx supabase migration list

# Step 2: Identify the problematic migration

# Step 3: Write a DOWN migration manually (Supabase doesn't auto-revert)
# Create new migration file that reverses the schema change

# Step 4: Apply the down migration
npx supabase db push

# Step 5: Redeploy app matching code version
```

**Backup check before any revert:**
```
Supabase Dashboard → Database → Backups
Confirm latest backup available before proceeding
```

---

## Section 3 — Payment Webhook Issue

**Time: ~5 minutes**
**Use when:** Orders stuck on "pending" payment status, double charges, webhook not firing

```bash
# Step 1: Check PayMob dashboard — webhook delivery logs
# Step 2: Verify HMAC secret matches .env (PAYMOB_HMAC_SECRET)
# Step 3: Check orders table — payment_intent_id should be unique
#         (idempotency key prevents duplicate order creation)

# If webhook completely down:
# - Manually verify payment in PayMob dashboard
# - Manually update order payment_status in Supabase if confirmed paid
# - Document every manual intervention in incident log below
```

---

## Section 4 — Environment Variable Fix

**Time: ~2 minutes**

```bash
# Vercel environment fix
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production
# Enter value when prompted

# After env fix — redeploy required
vercel --prod
```

---

## Section 5 — Customizer Performance/Animation Rollback

**Use when:** Customizer lagging, animations broken, layer positioning wrong after a deploy

```bash
# Step 1: Roll back to previous Vercel deployment (Section 1) immediately
#         — this is a user-facing core feature, do not leave broken

# Step 2: Check recent commits to:
#   src/components/customizer/*
#   src/store/useCustomizerStore.ts
#   src/lib/layerConfig.ts

# Step 3: Test isolated on staging before re-attempting deploy
#   - 60fps check on mid-range Android
#   - Layer z-index order correct (bottom_bun=1 ... top_bun=10)
#   - Price calculation matches server validation
```

---

## Section 5A — Site Completely Unreachable (Supabase Free-Tier Pause)

**Use when:** Everything is down at once — not one feature, the whole app — and nothing in the recent deploy history explains it.

```
Supabase free-tier projects automatically pause after approximately
7 days of no API traffic. This is the single most likely cause of a
"the whole site is down for no reason" incident on this stack, and it
is NOT covered by a Vercel rollback — Vercel will roll back fine, but
the app will still fail every request because the database itself is
asleep.

Step 1: Check Supabase Dashboard → Project → look for a "Paused" banner
Step 2: If paused, click "Restore" — takes a few minutes to come back online
Step 3: Once restored, re-run smoke tests from DEPLOYMENT.md before
        telling anyone the incident is resolved
Step 4: To prevent recurrence — either:
  (a) Set up a scheduled health-check ping (e.g. GitHub Actions cron
      hitting /api/health every few days) to keep the project warm, or
  (b) Upgrade to Supabase Pro before/at public launch, which removes
      auto-pause entirely
```

⚠️ This is a structural conflict in the free-tier mandate, not a one-off
bug: a "free tier only" MVP that goes quiet during a slow week (low
season, late-night hours, soft launch with few testers) can go
completely offline without anyone touching the code. Treat this as a
known risk to monitor, not a hypothetical — see SECURITY.md Section 7
for the disaster-recovery note on this.

---

```
Issue Level:

MINOR (UI broken, 1 feature down, customizer still works):
  → Fix via normal PR process
  → No immediate rollback needed

MODERATE (Customizer broken, payment errors, order placement failing):
  → Inform team immediately
  → Rollback within 15 minutes if no fix

CRITICAL (Data breach, DB corruption, all orders affected, payment
double-charging):
  → Inform team + owner IMMEDIATELY
  → Rollback within 5 minutes
  → Incident report required

Services Status Pages:
  Vercel:    vercel.com/status
  Supabase:  status.supabase.com
  PayMob:    check PayMob dashboard/support directly
```

---

## Section 7 — Post-Rollback Checklist

```
[ ] Production stable — health check green
[ ] Home screen loads correctly
[ ] Customizer opens and functions (core feature — verify thoroughly)
[ ] Orders placing successfully
[ ] Payments processing correctly
[ ] KDS receiving orders in real-time
[ ] No data loss occurred
[ ] Error monitoring (Sentry) clear
[ ] Team informed about rollback
[ ] Root cause identified
[ ] Fix plan documented
[ ] Post-mortem scheduled
```

---

## Incident Log Template

```
Date:               _______________
Time Down:          _______________
Time Restored:      _______________
Affected Feature:   _______________
Root Cause:         _______________
Rollback Used:      Section ___ — _______________
Data Loss:          YES / NO
Orders Affected:    _______________
Fix Applied:        _______________
Prevention:         _______________
```

---

## Changes Made (Audit Pass)

- Translated the entire 30-second decision tree (header note + all 6 yes/no branches) from Roman Urdu to professional English.
- Added a new Section 5A covering Supabase free-tier auto-pause — confirmed current behavior (as of mid-2026): free-tier projects pause after roughly 7 days without API traffic. None of the original files mentioned this, and it's a realistic way for this exact app to go fully dark with zero code changes. Added a corresponding branch to the decision tree at the top.
- This file otherwise didn't need restructuring — the section-based decision tree format was already clear and well organized once translated.
