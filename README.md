# FUEL — Phase 1

Editorial nutrition-tracking PWA. Sibling app to OVERLOAD; same orange/blue accent palette, opposite vibe — warm, soft, generous.

> **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Framer Motion · lucide-react · @zxing/browser · localStorage only.

## Phase 1 scope (this build)

- **No auth, no Supabase yet.** Everything lives in `localStorage` keyed `fuel.*.v1`. Phase 4 will migrate to Supabase + connect to OVERLOAD.
- **Onboarding** with Mifflin-St Jeor BMR/TDEE → editable calorie + macro targets.
- **Search foods** via [USDA FoodData Central](https://fdc.nal.usda.gov/api-guide.html) + [Open Food Facts](https://world.openfoodfacts.org/data) at `/api/search`. Results merged + deduped.
- **Barcode scanner** at `/scan` using `@zxing/browser`. Looks up via `/api/barcode/[upc]` → OFF first, USDA branded fallback. Results cached locally so repeat scans are instant.
- **Today** (home): calorie ring, macro bars, water + weight, four meal cards.
- **Log**: 14-day strip + per-day breakdown.
- **Trends**: 14-day calorie / protein / weight sparklines + a **micronutrient gaps** panel (the MFP miss).
- **Custom food** creation with full nutrient panel (macros + fats + 12 vitamins + 10 minerals).
- **Settings**: theme (system/light/dark), units, profile + targets (auto-recompute), JSON export/import, reset everything.
- **PWA**: manifest, service worker (cache-first shell, network-first HTML), home-screen icons, theme color split between light/dark.

## Run

```bash
npm install
npm run dev          # localhost:3000
npm run build        # production build
npm run gen-icons    # regenerate PWA icons
```

## Environment

`USDA_API_KEY` (optional). Defaults to `DEMO_KEY` which works but is rate-limited. Get a free key at https://fdc.nal.usda.gov/api-key-signup.html and add it to `.env.local` and Vercel env.

## What's deferred

- **Phase 2**: Nutritionix API for chains, USDA Branded as fallback, recipes, full micronutrient progress UI on the dashboard, copy-yesterday, favorites surfacing.
- **Phase 3**: Trends (monthly views, per-nutrient drill-downs), Chipotle-style ingredient builder, keyboard shortcuts, light-mode polish pass.
- **Phase 4**: Supabase auth + sync + OVERLOAD integration. Migrates this localStorage data on first sign-in.

## Design

- **Light** (default): warm cream `#FAF7F2` substrate, off-black ink, generous whitespace, editorial serif (Fraunces) for hero typography, Inter for body, JetBrains Mono for numbers.
- **Dark**: warm near-black `#16140F` (softer than OVERLOAD's `#0A0A0A`).
- **Accents**: orange `#FF6A00` for actions/PRs/heat, blue `#2E7BFF` for info/data/cold. Same accent system as OVERLOAD.
- **Logo**: horizontal three-bar "fuel gauge" mark — siblings of OVERLOAD's vertical ascending bars.
