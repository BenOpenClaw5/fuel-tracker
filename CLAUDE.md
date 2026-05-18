@AGENTS.md

# FUEL — context for a fresh session

Production: https://fuel-tracker-sooty.vercel.app
Repo: https://github.com/BenOpenClaw5/fuel-tracker

Personal-use editorial nutrition tracker. Sibling app to OVERLOAD
(`../overload-tracker`). iPhone Safari is the primary device.
**localStorage only, no auth** (Supabase + cross-app sync is Phase 4).

## Stack
Next.js 16 (App Router) · TS strict · Tailwind v4 · framer-motion ·
lucide-react · @zxing/browser · Fraunces + Inter + JetBrains Mono ·
sharp (icon gen). Playwright for e2e (`npm run test`).

## Design
Things-3-inspired editorial. Warm cream substrate `#FAF7F2`, warm-black
ink `#1A1814`. Soft dark mode `#16140F` — intentionally softer than
OVERLOAD's pure black so the two apps read as siblings on the home
screen. **Orange `#FF6A00`** for heat, **blue `#2E7BFF`** for cold —
same accent system as OVERLOAD. Generous whitespace. Rounded corners
(`--radius-lg: 14px`). Mark is three horizontal ascending bars (sibling
to OVERLOAD's vertical mark).

## Architecture highlights

**Curated foods database** (the architectural win — bundled, instant,
never depends on USDA/OFF):
- `src/data/wholeFoods.ts` — 70+ whole foods with multiple
  `ServingOption[]` (grams/oz/cup/"1 medium"), raw + cooked variants
  where prep matters.
- `src/data/chains.ts` — 45+ chain items (Chick-fil-A 8/12/30ct
  grilled + regular nuggets and all sauces, McDonald's, Chipotle
  component builds, Starbucks).
- `src/data/index.ts` exposes `curatedSearch(q)` — token-AND match
  with exact/prefix/substring scoring.
- `/api/search` order: **curated → USDA whole → USDA branded → OFF**.
  Returns 200 with `errors[]` on partial failure (never 500).

**Nutrient meta** drives the entire UI from a single source of truth in
`src/lib/nutrients.ts`:
- Each nutrient has `group` (`macro` | `macroDetail` | `minerals` |
  `vitamins`), `goalDirection` (`up`/`down`/`band`), and `watch?` flag.
- KeyNutrients filters by `watch === true` (fiber, sat fat, sodium,
  added sugar).
- MicroPanel filters by `vitamins` + `minerals`.
- Status colors come from `nutrientStatus(value, target, direction)`
  so "down" goals at 92% read warn; "up" goals at 92% read good.

**NutrientDetailSheet** — tap any macro bar, KeyNutrients tile, or
MicroPanel row → bottom sheet with today's foods ranked by contribution
to that nutrient + %-share bars.

**Multi-serving picker** in AddEntrySheet. Each food contributes its
own options; FUEL always appends universal "1 g" and "1 oz (28.35 g)".
Log snapshot stores the chosen serving so rows read "2× 4 oz cooked
(113 g)" instead of generic counts.

## Critical behaviour (don't undo)

- Search requires **≥2 chars** before firing.
- Client search cache (`src/lib/searchCache.ts`) **never caches empty
  results** — Ben hit a bug where stale empty results blocked retries.
- Toast actions (Undo on log delete) — `onToastAction(actionId, cb)`
  pattern. Restores within 5s.
- Drill-down sheet uses `role="dialog"` with `aria-label="<nutrient>
  detail"` — Playwright tests rely on these roles.

## Commands

```
npm run dev          # localhost:3000
npm run build
npm run lint
npm run test         # Playwright
npm run gen-icons
```

Run Playwright against prod after deploy:
```
PW_BASE_URL="https://fuel-tracker-sooty.vercel.app" npx playwright test
```

**Current test count: 19/19 green local + prod.**

## Deploy

`vercel --yes --prod`. Push to `main` via `gh` CLI as `BenOpenClaw5`.

## What's next (when Ben asks)

- **Phase 4**: Supabase auth + sync; migrate OVERLOAD too; shared
  `profiles` row; training-day calorie auto-adjust (OVERLOAD finish
  → FUEL +N kcal for the day).
- **Apple Watch**: not directly possible from a web PWA. Agreed path
  is iOS Shortcut → URL handoff to `/health-import?d=<base64-json>`
  with `{ weightKg, activeKcal, restingKcal, workouts[] }`. Auto-
  populates WeightCard and shows `+activeKcal` badge on calorie ring.
  ~200-line change. Once Phase 4 backend lands, swap URL handoff for
  a webhook (same payload shape).
- Expand curated DB (Cava, Sweetgreen, Panera, Subway, Five Guys, etc.
  — add records to `src/data/chains.ts`).
- Nutritionix API for chains (paid; only if curated isn't enough).
- cmdk command palette (⌘K) for power-user keyboard nav.
- Drill-down sheet on past days from /log (currently Today only).

## Env

- `USDA_API_KEY` — optional, lifts rate limit. Currently using
  `DEMO_KEY` in prod. Curated DB makes this non-critical.
