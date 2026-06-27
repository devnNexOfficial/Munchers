# checklist_shared.md — Muncherz
# BOTH DEVELOPERS — Final Sections (Do Together at End)
# ============================================================
# IMPORTANT — READ BEFORE STARTING ANY SECTION:
#
# These 3 sections are done TOGETHER by Dev 1 and Dev 2
# after ALL their individual sections are complete.
# Do NOT start these until every item in checklist_dev1.md
# and checklist_dev2.md is marked [x].
#
# Coordinate in real-time for these sections —
# especially Section 31 (pentest) which requires both
# developers testing together simultaneously.
#
# Read ai-instructions.md and ARCHITECTURE.md before starting.
# ============================================================

---

## SECTION 30 — SEO, AEO, GEO & Performance Pass
**Dependencies: All user-facing sections (5 through 16) — Dev 1 must finish first**
**Entirely frontend.**

```
[ ] generateMetadata() implemented on every page — title, description,
      OG image, canonical URL
[ ] JSON-LD structured data:
      [ ] LocalBusiness/Restaurant schema on home page
      [ ] Menu schema on category/item pages
      [ ] BreadcrumbList on nested pages
[ ] next-sitemap configured — sitemap.xml auto-generated and verified
[ ] robots.txt configured correctly (allow public pages, disallow
      /restaurant, /developer, /kitchen, /api)
[ ] /llm.txt created for AI crawler discoverability
[ ] hreflang tags for EN/UR versions
[ ] RTL layout verified correct across all user-facing pages in Urdu mode
[ ] Alt text present on every image, translated for Urdu mode
[ ] Lighthouse audit run — Performance/SEO/Accessibility/Best Practices
      all scored, issues addressed:
      [ ] LCP < 2.5s
      [ ] CLS < 0.1
      [ ] FID/INP < 100ms
      [ ] Bundle size reviewed, code-splitting confirmed on customizer
[ ] Image optimization audit — all images via next/image, WebP confirmed,
      ingredient PNGs under 200KB each
[ ] Test: Lighthouse score re-checked after any major feature addition,
      not just once at the end
```

---

## SECTION 31 — Security Hardening Pass
**Dependencies: All sections involving user input or money**
**No frontend-specific build tasks** — this section is backend-owned.
Both developers participate in the joint pentest pass below.

**🤝 JOINT (run together with backend dev — both Dev 1 and Dev 2 present):**
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
[ ] App crash recovery — customizer progress auto-saved locally
      (Zustand persist middleware), restorable on reload with
      "Continue your customization?" prompt
[ ] Internet-lost-during-order-placement UI handling — clear success/
      failure status shown, never left ambiguous
[ ] Slow network mode — reduce/simplify animations gracefully, ensure
      core flows remain usable on throttled connections
[ ] Friendly error UI components everywhere — no raw error codes/stack
      traces ever shown to end users (English + Urdu versions)
[ ] Skeleton loading states on all major data-fetching screens (home,
      menu, cart, orders) instead of blank screens
[ ] Empty states designed for: empty cart, no saved creations, no
      order history, no feedback yet (restaurant side)
[ ] Final cross-device test pass — at minimum: one low-end Android,
      one modern Android, one iPhone, desktop Chrome/Safari
```

**🤝 JOINT (Dev 1 + Dev 2 + backend dev together):**
```
[ ] Final full end-to-end order flow test — browse → customize → meal →
      cart → checkout → payment → KDS → kitchen LCD → ready → rider →
      delivered → feedback, with every toggle (printer, QR, GST, surge,
      loyalty) tested both ON and OFF
```

---

## Shared Progress Tracker

```
Dev 1 sections complete:  [ ] (confirm before starting here)
Dev 2 sections complete:  [ ] (confirm before starting here)

[ ] 30. SEO, AEO, GEO & Performance Pass
[ ] 31. Security Hardening Pass (joint pentest)
[ ] 32. Final Polish & Edge Cases (joint)
```
