# quick-reference-codex.md — Muncherz
# Quick reference for Codex AI code editor.
# Full detail lives in ai-instructions.md — READ THAT FIRST, every time.
# Codex does not auto-detect this file — paste/reference it manually
# in your prompt alongside the relevant section from final_master_checklist.md.

## Project
Single-restaurant premium food ordering app. Brand: Red (#D62828) + Yellow (#F7B731) + Black (#0A0A0A — customizer canvas background only).
Core feature: Live 2.5D burger/pizza customizer. This is a PREMIUM FOOD APP, not a game.

## Stack (do not deviate)
- Next.js 15, App Router only
- TypeScript strict mode — no `any`, no implicit types
- Tailwind CSS + Shadcn UI
- Framer Motion for all animation
- Zustand for state (customizer, cart, order)
- Supabase (PostgreSQL + RLS + Realtime + Auth + Storage)
- Zod for all validation
- next/image always — never raw <img>
- PayMob for payments (JazzCash/Easypaisa/Card)

## Core Feature Rules — Customizer
1. Entry: menu photo implodes + fades → black screen → split layout (left ingredients / center canvas / right summary list)
2. Bottom bun auto-placed if single type, else user picks. Always z-index 1.
3. Top bun ALWAYS z-index 10 (top of stack), auto-placed same logic as bottom bun.
4. Patty + Cheese = CORE, is_required = true, min qty 1, cannot delete to zero — show alert if attempted.
5. Everything after cheese = FLEXIBLE — user can skip/add/remove freely, navigate forward/back.
6. Toppings use 3-tier quantity images (light/regular/extra) — NOT individual +1 taps for bulk items.
7. Same sauce tapped twice = same image, zero gap, opacity blend (looks thicker). Different sauce = separate layer.
8. Max limit per ingredient (restaurant-set) → fill bar + shake animation + disabled button when hit.
9. Price/time calculate LOCALLY (Zustand) on every tap — odometer animation, NO API call during customization.
10. On Add to Cart: client sends ingredient IDs + qty only. SERVER recalculates price independently. Mismatch = reject + log.
11. Right panel = live synced summary list (pic + name + qty + price), white background, contrasts black canvas.
12. `is_core`/`is_required` source of truth at runtime = `menu_item_ingredients` table, never the `ingredients`-level flags (those are defaults only, used once at assignment time).

## Non-negotiables
- Security: RLS on every table, Zod on every input, server-side price validation always, rate limiting on OTP/orders, per-user MFA enrollment for developer panel (never one shared TOTP secret).
- Performance: 60fps customizer animations, LCP < 2.5s, next/image everywhere, code-split heavy components.
- SEO/AEO/GEO: generateMetadata() every page, JSON-LD structured data, sitemap, robots.txt, semantic HTML.
- Clean code: typed, modular, <200 lines per component, conventional commits.
- Free tier services only in MVP — but monitor real limits (Supabase: 200 concurrent Realtime connections, ~7-day auto-pause without traffic). Not hypothetical, check ARCHITECTURE.md / SECURITY.md.

## File/Folder conventions
- Components: PascalCase. Hooks/utils: camelCase. Constants: UPPER_SNAKE.
- Import order: React/Next → third-party → @/ absolute → relative.
- Server Components by default, 'use client' only when hooks/state/animation needed.

## Never do
- No game elements (scoreboards, confetti, cartoon SFX, neon colors).
- No alternate libraries duplicating Zustand/Framer Motion/Tailwind purpose.
- No trusting client-calculated price for final order.
- No building dependent features before prerequisite section works.
- No paid services without explicit approval.
- No assuming the schema is multi-restaurant-ready — it currently isn't (no `restaurant_id` column anywhere). Treat as single-tenant unless the team has explicitly decided otherwise (see ARCHITECTURE.md).

## How to prompt Codex with this file
Codex (CLI or IDE extension) works best with explicit, scoped instructions
per run rather than implicit project-wide rule files. Structure every
prompt like this:

```
1. Paste/reference the relevant section content from this file
   (or the full ai-instructions.md if the task touches the customizer
   core logic specifically)
2. Paste the exact checklist item(s) you're working on from
   final_master_checklist.md (one function/component at a time —
   not the whole section)
3. State the single deliverable clearly: "Build ONLY [X], nothing else"
4. If working in Codex CLI with repo access, point it explicitly at
   ai-instructions.md and ARCHITECTURE.md paths so it reads current
   schema/rules from disk rather than relying on memory of a prior turn
5. Ask Codex to confirm it understood the core/flexible ingredient rule
   and the server-side price validation rule before generating code,
   if the task touches the customizer or order placement
```

## Workflow
One checklist item (function/component level) at a time. Reference ai-instructions.md content in every prompt — Codex will not read it automatically unless given the file path/content in-context. Run type-check + lint + build before commit.
