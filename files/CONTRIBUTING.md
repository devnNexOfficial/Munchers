# Contributing Guide — Muncherz
# Read BEFORE writing any code

---

## 🔐 SENSITIVE DATA — STRICTLY FORBIDDEN

```
⛔ NEVER commit .env.local or any .env.* with values
⛔ NEVER push API keys, passwords, secrets to GitHub
⛔ NEVER log sensitive data (phone numbers, OTPs, payment tokens)
⛔ NEVER put secrets in comments, README, or docs
⛔ NEVER share API keys in WhatsApp/email as plain text
⛔ NEVER use production credentials in development
⛔ NEVER push node_modules, .next, *.pem, *.key files

✅ ALWAYS use .env.local (in .gitignore)
✅ ALWAYS use .env.example for documentation (values empty)
✅ ALWAYS rotate a key if accidentally pushed to Git
✅ ALWAYS use GitHub Secrets for CI/CD
✅ ALWAYS use Supabase Vault for sensitive merchant config

If you accidentally push a secret:
  1. Immediately rotate/revoke the key
  2. Force push to remove from history
  3. Inform team immediately
```

---

## Team Structure

```
3 developers build this project. Work division (frontend/customizer
engine/backend or otherwise) is decided by the team directly — no fixed
file ownership is enforced in this document.

⚠️ Rule: Communicate before working on a file someone else is actively
         editing. Avoid merge conflicts through sync, not luck.
```

---

## Git Workflow

### Branch Naming (STRICT)
```
feature/section-name       New feature
fix/bug-description        Bug fix
chore/task-name            Setup, config, deps
docs/doc-name               Documentation only
refactor/component-name    Refactoring

Examples:
  feature/customizer-canvas
  feature/kds-realtime
  fix/sauce-blend-gap
  chore/setup-supabase-schema
  fix/price-validation-mismatch
```

### Branch Rules
```
main     → Production. Direct push BANNED. PR only.
develop  → Integration. Feature branches merge here.
feature/* → Your work. Branch from develop.

Flow:
  git checkout develop
  git pull origin develop
  git checkout -b feature/my-feature
  [work + commits]
  git push origin feature/my-feature
  → Open PR to develop (NOT main)
```

### Commit Format — Conventional Commits MANDATORY
```
feat: add burger layer drop animation
fix: sauce blend opacity gap on double tap
fix: server price mismatch rejection logic
chore: update framer-motion to 11.x
docs: update customizer logic in ai-instructions
refactor: extract limit bar into separate component
test: add unit tests for price calculator
security: add rate limit on otp send endpoint

Rules:
  ✅ Lowercase
  ✅ Present tense
  ✅ Max 72 characters
  ✅ English only
  ❌ No "WIP" commits to develop/main
  ❌ No "fix fix fix" messages
  ❌ No committing commented-out code
```

---

## Vibe Coding Workflow (Section by Section)

```
Step 1: Open final_master_checklist.md
Step 2: Pick ONE section to work on
Step 3: Write a prompt that references ai-instructions.md +
        the specific checklist section + .cursorrules
Step 4: Add/check checklist items for that section
Step 5: Give prompt to AI editor
Step 6: Review code — check it follows ai-instructions.md exactly
        (especially the customizer logic section if relevant)
Step 7: Run checkpoint:
          npm run type-check
          npm run lint
          npm run build
Step 8: If all pass → commit → next section
Step 9: Never start next section before current passes

⚠️ IMPORTANT:
  - Work on exactly one section at a time
  - Never move on while a section is left incomplete
  - Commit each section's code separately
```

---

## Code Standards

### TypeScript
```typescript
// ✅ CORRECT
const itemId: string = params.id
const ingredients: Ingredient[] = await getIngredients(itemId)

// ❌ WRONG
const itemId: any = params.id
var ingredients = await getIngredients(itemId)
```

### File Naming
```
React Components:   PascalCase    BurgerCanvas.tsx
Hooks:               camelCase     useCustomizerStore.ts
Lib/Utils:           camelCase     priceCalculator.ts
Type files:          camelCase     menuTypes.ts
Constant values:     UPPER_SNAKE   MAX_TOPPING_LIMIT = 5
Constant files:      camelCase     layerConfig.ts
```

### Import Order (ESLint enforced)
```typescript
// 1. React/Next
import { useState } from 'react'
import Image from 'next/image'

// 2. Third party
import { motion } from 'framer-motion'
import { z } from 'zod'

// 3. Internal absolute (@/)
import { useCustomizerStore } from '@/store/useCustomizerStore'
import { supabase } from '@/lib/supabase'

// 4. Internal relative
import { IngredientCard } from './IngredientCard'
import type { Ingredient } from './types'
```

---

## Pre-Commit Checklist (Husky auto-runs)

```bash
npm run type-check    # tsc --noEmit — MUST PASS
npm run lint          # ESLint — MUST PASS
npm run build         # Next.js build — MUST PASS
```

If any fail → fix before committing. No exceptions.

---

## Pull Request Rules

```
1. PR target: develop (NEVER directly to main)
2. Minimum 1 team member review
3. All CI checks must pass (GitHub Actions)
4. Self-review before requesting review
5. UI changes: attach screenshot or screen recording
   (especially for any customizer animation change)
6. Breaking changes: clearly mention in PR description
7. No PR merges right before going offline (deployment risk)

PR Title Format:
  feat: [section] description
  fix: [component] description
  chore: [area] description
```

---

## Environment Setup (New Developer)

```bash
# 1. Clone
git clone [repo-url]
cd muncherz

# 2. Install (use npm ci — NOT npm install)
npm ci

# 3. Environment
cp .env.example .env.local
# Fill in your values — ask team for dev credentials
# NEVER use production credentials for development

# 4. Database
npx supabase login
npx supabase link --project-ref [your-project-ref]
npx supabase db push

# 5. Run
npm run dev
```

---

## Testing Requirements

```
Every new feature MUST have:
  Unit test (Vitest):        src/**/*.test.ts
  Integration test:          src/**/*.spec.ts

Critical flows that need tests:
  - Customizer price calculation (client + server match)
  - Core ingredient cannot reach zero quantity
  - Max limit enforcement per ingredient
  - Order placement with price validation
  - OTP send + verify flow
  - Payment webhook idempotency

Coverage thresholds (enforced in CI):
  src/lib/          90%+
  src/app/api/      95%+
  src/components/   80%+
```

---

## Deployment

```
Development:  npm run dev
Staging:      Push to develop → Vercel preview deploy
Production:   PR to main → team review → merge → auto-deploy

Database migrations:
  ✅ ALWAYS: npx supabase db push (via migration files)
  ❌ NEVER: manual schema edits directly in Supabase dashboard
            for anything beyond quick prototyping

Secrets in CI/CD:
  All secrets in GitHub Secrets (Settings → Secrets)
  NEVER in workflow yml files as plain text
```

---

## Questions & References

```
Architecture overview:     ARCHITECTURE.md
Full AI coding rules:      ai-instructions.md     ← READ FIRST before coding
AI editor rules:           .cursorrules
Complete checklist:        final_master_checklist.md
Environment variables:     .env.example
Deploy checklist:          DEPLOYMENT.md
Emergency rollback:        ROLLBACK.md
Master security reference: SECURITY.md            ← cross-check during Section 31
```

---

## Changes Made (Audit Pass)

- Translated three Roman Urdu workflow bullets to professional English.
- Added the missing `SECURITY.md` reference to the "Questions & References" section — it was omitted despite being the master security checklist that every other file (including this one) defers to.
- No tech-stack or feature-consistency issues found specific to this file; the larger architectural findings (real-time channel naming, the env var mismatch, the multi-tenancy gap) live in `ARCHITECTURE.md`, `DEPLOYMENT.md`, and `ai-instructions.md` — see those files' own "Changes Made" sections.
