# SECURITY.md — Muncherz
# Master security reference. Every point here must be implemented.
# Cross-check this file during Section 31 (Security Hardening Pass)
# in final_master_checklist.md

---

## 1. Transport & Network Security

```
✅ TLS 1.3
   - Vercel + Supabase provide TLS 1.3 by default — VERIFY explicitly
     during deployment, do not assume
   - Custom domain SSL certificate auto-renewed (Vercel handles this)
   - Test: ssllabs.com/ssltest against production domain, target A/A+

✅ HTTPS enforced everywhere
   - HTTP requests auto-redirect to HTTPS (Vercel default, verify)
   - HSTS header set: Strict-Transport-Security: max-age=63072000;
     includeSubDomains; preload

✅ WAF (Web Application Firewall)
   - Cloudflare free tier in front of Vercel domain
   - Rules: block known bad bot signatures, basic SQL injection
     pattern blocking, geographic anomaly flagging (optional)
   - Rate limiting at edge level (in addition to app-level rate
     limiting — defense in depth)

✅ DDoS protection
   - Cloudflare free tier provides baseline DDoS mitigation
   - Vercel also has built-in protection at platform level
```

---

## 2. Authentication & Session Security

```
✅ Secure cookies
   - httpOnly: true (JS cannot access — prevents XSS token theft)
   - secure: true (HTTPS only)
   - sameSite: 'lax' or 'strict' (CSRF mitigation)
   - Session JWTs short-lived, refresh token rotation via Supabase Auth

✅ MFA for admin (Developer Panel)
   - TOTP-based 2FA mandatory for /developer/* access
   - No bypass path — every login requires both password + TOTP code
   - Backup codes generated once, stored hashed, single-use
   - ⚠️ MUST be enrolled per-user (each developer/admin has their own
     TOTP secret, ideally via Supabase Auth's native MFA factor
     enrollment, stored per-user in the database). A single shared
     secret in an app-level env variable — which is literally what
     `.env.example`'s `DEVELOPER_2FA_SECRET` implies as written — means
     anyone with that one secret can authenticate as any developer, with
     no way to revoke one person's access without rotating it for
     everyone, and no audit trail of which developer actually approved
     an action. This is the single most concrete gap found in this
     audit; fix it before relying on 2FA for anything beyond a
     single-developer MVP.

✅ Phone OTP security (User Panel)
   - OTP expires in 5 minutes
   - Max 3 verify attempts per OTP before requiring new send
   - Rate limit: 3 sends per phone number per 10 minutes
   - OTP never logged in plaintext anywhere (server logs, error
     tracking, activity_logs)

✅ Restaurant Staff Auth
   - Email + Password (Supabase Auth, bcrypt hashing built-in)
   - Password minimum requirements enforced (8+ chars, not common
     password list — Supabase Auth default policy)
   - Session timeout: auto-logout after period of inactivity
     (configurable, recommend 30 min for restaurant panel)

✅ Kitchen LCD PIN Security
   - PIN hashed before storage (never plaintext) — use bcrypt or argon2
   - 3 wrong attempts → device lockout + alert to owner
   - Device-bound session (long-lived but revocable instantly from
     restaurant panel)
   - Note on `KITCHEN_PIN_SALT`: bcrypt and argon2 already generate a
     unique random salt per hash automatically — that's not what this
     env variable is for. If it's a fixed, app-wide secret value mixed
     into every hash, the correct term for that is a **pepper**, not a
     salt, and it should be documented as such so a future developer
     doesn't assume bcrypt's automatic salting makes this variable
     redundant and remove it.

✅ RBAC (Role-Based Access Control)
   - Three restaurant roles: owner / manager / chef
   - Enforced at BOTH UI level (hide unauthorized nav/buttons) AND
     API level (every protected route checks role server-side —
     UI hiding alone is NEVER sufficient)
   - Chef role cannot reach any restaurant route except KDS, even via
     direct URL manipulation
```

---

## 3. Database Security

```
✅ RLS policies (Row Level Security)
   - Enabled on EVERY table without exception — no table left with
     RLS disabled, including lookup/reference tables
   - Default-deny posture: explicit policies required to allow any
     access, nothing accessible by default
   - Policies tested for: own-data-only access (users), role-scoped
     access (staff), public-read-only (menu data)

✅ UUID IDs
   - All primary keys use gen_random_uuid() — never sequential
     integers (prevents enumeration attacks, e.g. guessing
     /order/1043 → /order/1044)

✅ Parameterized queries
   - Supabase client library handles this by default — never
     construct raw SQL string concatenation with user input anywhere,
     even in custom RPC functions

✅ Least privilege DB roles
   - anon key: read-only public data, RLS-restricted writes only
   - service_role key: server-side only, NEVER exposed to client bundle
   - Verify with build output scan that service_role key never appears
     client-side

✅ PII masking
   - Phone numbers masked in non-essential views (e.g. analytics
     dashboards show "03XX-XXX1234" not full number)
   - Full PII (phone, address) visible only where operationally
     necessary: order fulfillment (restaurant KDS, rider view),
     never in aggregate analytics/reporting views
   - Feedback photos and complaint data access-restricted to
     restaurant staff only, never publicly queryable

✅ Backups
   - Supabase automated daily backups (free tier: point-in-time
     varies by plan — verify current retention window)
   - Manual backup export monthly at minimum, stored separately
     (e.g. downloaded SQL dump kept outside Supabase as extra safety)
   - Backup restore tested at least once before going to production
     (untested backups are not real backups)
```

---

## 4. API & Application Security

```
✅ API rate limiting
   - OTP send: 3 per phone per 10 minutes
   - Order placement: 10 per user per hour
   - Payment initiation: 5 per user per hour
   - Kitchen PIN attempts: 3 before lockout
   - General API: 100 requests per IP per minute (edge-level via
     Cloudflare + app-level via middleware)

✅ Input validation
   - Zod schema validation on EVERY API route, no exceptions —
     validate shape, type, length, and format before any processing
   - Reject early with generic error messages (don't leak which
     specific field/rule failed in ways that aid attackers probing
     the system)

✅ Output encoding / XSS prevention
   - React's default escaping relied upon — never use
     dangerouslySetInnerHTML with unsanitized user input
   - Any rendered user-generated text (feedback comments, special
     instructions) passed through DOMPurify if HTML rendering is
     ever needed; plain text rendering preferred wherever possible

✅ CSRF protection
   - SameSite cookie attribute (see Section 2)
   - State-changing requests (order placement, settings changes) only
     accepted via POST/PATCH with proper session validation, never
     via GET with side effects

✅ Server-side pricing (CRITICAL — core anti-fraud control)
   - Client-calculated prices are for UX display ONLY
   - Every order placement re-fetches ingredient/item prices from
     Supabase server-side and recalculates independently
   - Mismatch between client-submitted total and server-calculated
     total → order rejected, attempt logged to activity_logs
   - Same principle applies to delivery charge
     calculation, and GST — all recalculated server-side, never
     trusted from client payload

✅ Payment webhook verification
   - HMAC signature verification on every PayMob webhook before
     processing (PAYMOB_HMAC_SECRET, server-only env variable)
   - Webhook payloads with invalid/missing signature rejected and
     logged immediately, never processed

✅ Idempotency keys
   - payment_intent_id unique constraint in orders table
   - Duplicate webhook deliveries (same intent ID) detected and
     ignored — does not create duplicate orders or double-process
     payment status updates

✅ File upload security
   - Type validation server-side (not just client-side/extension
     check — verify actual file content/MIME type)
   - Size limits enforced server-side (menu images, ingredient PNGs,
     feedback complaint photos)
   - Uploaded files stored in Supabase Storage with appropriate
     bucket privacy (public bucket for menu images only, private
     signed-URL access for anything sensitive)
```

---

## 5. Secrets Management

```
✅ Secrets management
   - All secrets in .env.local locally (gitignored), never committed
   - Production secrets in Vercel Environment Variables dashboard,
     scoped correctly (Production/Preview/Development separated)
   - NEXT_PUBLIC_* prefix used ONLY for genuinely public values —
     every other variable treated as server-only by default
   - Key rotation policy: if any key is accidentally exposed
     (committed, logged, shared in plaintext), it is rotated
     IMMEDIATELY, not "when convenient"
   - No secrets ever placed in: code comments, README, Slack/WhatsApp
     messages, commit messages, or CI/CD YAML files directly (use
     GitHub Secrets references instead)
   - PAYMOB_HMAC_SECRET, SUPABASE_SERVICE_ROLE_KEY, KITCHEN_PIN_SALT,
     DEVELOPER_2FA_SECRET — treated as highest-sensitivity tier,
     access restricted to minimum necessary team members
```

---

## 6. Logging, Monitoring & Auditing

```
✅ Audit logs
   - activity_logs table captures: price mismatch attempts, failed
     kitchen PIN attempts, role access denials, manual settings/price
     changes by staff (with before/after value), order
     cancellations/rejections with reason
   - Logs are INSERT-only via RLS policy — no UPDATE or DELETE
     permitted by any role, ensuring tamper-resistance
   - Logs retained for a minimum defined period (recommend 90 days
     minimum, longer for financial-relevant entries)

✅ Monitoring with Sentry
   - Error tracking enabled in production only (not dev, to avoid
     noise)
   - Captures: unhandled exceptions, API route errors, client-side
     React errors
   - Alerts configured for error rate spikes
   - Sensitive data scrubbing configured in Sentry (never send phone
     numbers, addresses, payment tokens to error tracking payloads)

✅ Performance monitoring (APM)
   - Vercel Analytics for Core Web Vitals (LCP, CLS, FID/INP) — real
     user monitoring in production
   - Database query performance tracked via Supabase dashboard
     (slow query log reviewed periodically)
   - Customizer-specific performance: manual FPS testing on
     representative devices before each deploy (automated APM for
     client-side animation FPS is not standard tooling — handled via
     manual QA checklist in DEPLOYMENT.md instead)

✅ Dependency scanning
   - GitHub Dependabot enabled on the repository (free) — automatic
     PRs for vulnerable dependency updates
   - npm audit run as part of CI pipeline — build fails on
     high/critical severity unresolved vulnerabilities
   - Dependency updates reviewed before merge, not blindly
     auto-merged for major version bumps

✅ OWASP Top 10 self-assessment
   - Manual review against current OWASP Top 10 list before
     production launch and after major feature additions:
     [ ] Broken Access Control — RBAC + RLS tested per role
     [ ] Cryptographic Failures — TLS 1.3, hashed PINs/passwords
     [ ] Injection — parameterized queries, Zod validation
     [ ] Insecure Design — price validation, idempotency reviewed
     [ ] Security Misconfiguration — headers, RLS, env vars checked
     [ ] Vulnerable Components — Dependabot + npm audit active
     [ ] Identification/Auth Failures — OTP/2FA/session rules tested
     [ ] Software/Data Integrity Failures — webhook HMAC verified
     [ ] Logging/Monitoring Failures — Sentry + activity_logs active
     [ ] Server-Side Request Forgery — no user-controlled server-side
           fetch destinations exist in this app; confirm if added later
```

---

## 7. Disaster Recovery & Business Continuity

```
✅ Disaster recovery plan
   - Defined Recovery Time Objective (RTO): target maximum acceptable
     downtime — recommend under 1 hour for this scale of app
   - Defined Recovery Point Objective (RPO): maximum acceptable data
     loss window — tied to backup frequency (daily backups = up to
     24hr RPO; consider more frequent backup for orders/payment data
     specifically if volume grows)
   - Documented recovery steps:
     1. Identify failure type (frontend/backend/database/payment) —
        see ROLLBACK.md decision tree
     2. Execute relevant rollback section
     3. If database corruption — restore from latest verified backup
     4. Verify data integrity post-restore (spot-check recent orders,
        financial totals)
     5. Communicate status (even if just internally for MVP stage)
   - Single point of failure review: Vercel + Supabase + PayMob are
     each third-party dependencies — status pages monitored
     (referenced in ROLLBACK.md Section 6)
   - Free-tier-specific risks (distinct from generic third-party
     outage risk, and currently unmonitored anywhere in this project):
     Supabase free-tier projects auto-pause after roughly 7 days
     without API traffic, and Realtime is capped at 200 concurrent
     connections. Both are realistic failure modes for a single-
     restaurant MVP with uneven traffic, not edge cases. See
     ROLLBACK.md Section 5A.
   - This DR plan is reviewed and updated after every incident
     (see Incident Log template in ROLLBACK.md)
```

---

## 8. Additional Security Practices (Beyond the Original 21 Points)

```
✅ Principle of least privilege (general)
   - Every role, every API key, every database policy grants the
     minimum access necessary — never broad/admin access by default

✅ Defense in depth
   - Security is layered, not single-point: client-side UX validation
     + server-side Zod validation + database RLS policy + activity
     logging, for the same data path (e.g. an order)

✅ Secure defaults
   - New ingredients/menu items default to is_available = false until
     explicitly published — nothing goes live accidentally
   - New staff accounts default to lowest-privilege role (chef) unless
     explicitly elevated by owner

✅ Data minimization
   - Only collect data genuinely needed for the app to function
     (phone, address, order history) — no unnecessary personal data
     fields added "in case we need it later"

✅ Right to deletion / account deletion
   - User-initiated account deletion removes/anonymizes personal data
     per applicable privacy expectations (already in Section 16 of
     checklist) — orders history may be retained in anonymized form
     for financial/legal record-keeping, but personal identifiers
     removed

✅ Third-party risk review
   - PayMob, Supabase, Vercel, Cloudflare — each reviewed for their
     own security posture/certifications before integration (standard
     practice, not a one-time checkbox — re-reviewed if any of these
     providers has a public security incident)

✅ Mobile/responsive security parity
   - Security rules (rate limiting, validation, RLS) apply identically
     regardless of client device — no "mobile-only" relaxed validation
     path exists anywhere

✅ Content Security Policy (CSP)
   - Strict CSP header configured in next.config.js, restricting
     script/style/image sources to trusted origins only — mitigates
     XSS impact even if an injection point is somehow missed elsewhere

✅ Clickjacking protection
   - X-Frame-Options: DENY (already referenced in ARCHITECTURE.md
     security headers) — prevents the app being embedded in a
     malicious iframe
```

---

## Security Checklist Cross-Reference

```
This file consolidates and expands security requirements already
distributed across:
  - ai-instructions.md  → "Security Rules" section
  - ARCHITECTURE.md     → "Security Architecture" section
  - CONTRIBUTING.md     → "Sensitive Data" section
  - DEPLOYMENT.md       → environment variable verification steps
  - ROLLBACK.md         → incident response procedures
  - final_master_checklist.md → Section 31 "Security Hardening Pass"

Use THIS file as the master reference when performing Section 31.
Every ✅ item above should be explicitly verified, not assumed done
just because it was mentioned once in an earlier document.
```

---

## Changes Made (Audit Pass)

- No Roman Urdu found in this file — it was already written entirely in professional English. No translation work needed here.
- **Flagged the most concrete security gap found in the entire audit:** the MFA section assumed per-user TOTP enrollment, but `.env.example` only defines a single `DEVELOPER_2FA_SECRET`, implying one shared secret for every developer/admin account. Added an explicit warning and recommendation (per-user enrollment via Supabase Auth's native MFA) directly in the MFA bullet, rather than leaving the contradiction between this file's stated policy and the actual env var unresolved.
- Clarified that `KITCHEN_PIN_SALT` is functioning as a pepper, not a salt, since bcrypt/argon2 already generate a per-hash salt automatically — purely a terminology fix so a future developer doesn't assume the variable is redundant and delete it.
- Added the confirmed-current free-tier risks (200 concurrent Realtime connections, ~7-day auto-pause) to the Disaster Recovery section, cross-referenced with the new ROLLBACK.md Section 5A.
