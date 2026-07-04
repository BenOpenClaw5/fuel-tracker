import type { Food, Nutrients } from "../types";

const OFF_BASE = "https://world.openfoodfacts.org";

interface OffNutriments {
  "energy-kcal_serving"?: number;
  "energy-kcal_100g"?: number;
  proteins_serving?: number;
  proteins_100g?: number;
  carbohydrates_serving?: number;
  carbohydrates_100g?: number;
  sugars_serving?: number;
  sugars_100g?: number;
  fiber_serving?: number;
  fiber_100g?: number;
  fat_serving?: number;
  fat_100g?: number;
  "saturated-fat_serving"?: number;
  "saturated-fat_100g"?: number;
  "trans-fat_serving"?: number;
  "trans-fat_100g"?: number;
  cholesterol_serving?: number;
  cholesterol_100g?: number;
  sodium_serving?: number;
  sodium_100g?: number;
  potassium_serving?: number;
  potassium_100g?: number;
  calcium_serving?: number;
  calcium_100g?: number;
  iron_serving?: number;
  iron_100g?: number;
  magnesium_serving?: number;
  magnesium_100g?: number;
  zinc_serving?: number;
  zinc_100g?: number;
  "vitamin-a_serving"?: number;
  "vitamin-a_100g"?: number;
  "vitamin-c_serving"?: number;
  "vitamin-c_100g"?: number;
  "vitamin-d_serving"?: number;
  "vitamin-d_100g"?: number;
  [k: string]: number | undefined;
}

interface OffProduct {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  serving_size?: string;
  serving_quantity?: number;
  nutriments?: OffNutriments;
  image_thumb_url?: string;
}

/**
 * Resolve one nutrient to a per-serving amount.
 *   - When the product declares a serving size, prefer the exact `_serving`
 *     value, else scale the `_100g` value to that serving.
 *   - When the serving size is UNKNOWN, we default the serving to 100 g and use
 *     the `_100g` value directly. (The old code returned null here, which is why
 *     scanned items like candy showed all dashes despite OFF having per-100g
 *     data.)
 */
function pickServing<K extends keyof OffNutriments>(
  n: OffNutriments | undefined,
  servingKey: K,
  per100Key: K,
  servingG: number,
  servingKnown: boolean,
): number | null {
  if (!n) return null;
  const direct = n[servingKey];
  const per100 = n[per100Key];
  if (servingKnown && typeof direct === "number" && Number.isFinite(direct)) {
    return direct;
  }
  if (typeof per100 === "number" && Number.isFinite(per100)) {
    return (per100 * servingG) / 100;
  }
  // last resort — an isolated `_serving` value with no serving size known
  if (typeof direct === "number" && Number.isFinite(direct)) return direct;
  return null;
}

function offToFood(p: OffProduct): Food | null {
  if (!p.code) return null;
  const name = p.product_name_en || p.product_name || "Unnamed product";
  const brand = (p.brands || "").split(",")[0]?.trim() || undefined;

  const parsedServing = p.serving_quantity ? Number(p.serving_quantity) : 0;
  const servingKnown = Number.isFinite(parsedServing) && parsedServing > 0;
  // Unknown serving → treat nutrients as per 100 g so we still surface values.
  const servingG = servingKnown ? parsedServing : 100;
  const servingLabel = servingKnown ? p.serving_size || `${servingG} g` : "100 g";

  const n = p.nutriments;
  const pick = <K extends keyof OffNutriments>(sKey: K, hKey: K) =>
    pickServing(n, sKey, hKey, servingG, servingKnown);

  // Convert OFF sodium (g) to mg if present in grams
  let sodium_mg: number | null = null;
  const sodiumS = pick("sodium_serving", "sodium_100g");
  if (sodiumS != null) sodium_mg = Math.round(sodiumS * 1000);

  let cholesterol_mg: number | null = null;
  const cholS = pick("cholesterol_serving", "cholesterol_100g");
  if (cholS != null) cholesterol_mg = Math.round(cholS * 1000);

  // Vitamin A in OFF is reported in µg (RAE) at vitamin-a_serving
  const vitA = pick("vitamin-a_serving", "vitamin-a_100g");
  const vitC = pick("vitamin-c_serving", "vitamin-c_100g");
  const vitD = pick("vitamin-d_serving", "vitamin-d_100g");

  const nutrients: Nutrients = {
    calories: pick("energy-kcal_serving", "energy-kcal_100g") ?? null,
    protein_g: pick("proteins_serving", "proteins_100g"),
    carbs_g: pick("carbohydrates_serving", "carbohydrates_100g"),
    fat_g: pick("fat_serving", "fat_100g"),
    fiber_g: pick("fiber_serving", "fiber_100g"),
    sugar_g: pick("sugars_serving", "sugars_100g"),
    sat_fat_g: pick("saturated-fat_serving", "saturated-fat_100g"),
    trans_fat_g: pick("trans-fat_serving", "trans-fat_100g"),
    cholesterol_mg,
    sodium_mg,
    potassium_mg: roundOrNull(maybeMg(pick("potassium_serving", "potassium_100g"))),
    calcium_mg: roundOrNull(maybeMg(pick("calcium_serving", "calcium_100g"))),
    iron_mg: roundOrNull(maybeMg(pick("iron_serving", "iron_100g"))),
    magnesium_mg: roundOrNull(maybeMg(pick("magnesium_serving", "magnesium_100g"))),
    zinc_mg: roundOrNull(maybeMg(pick("zinc_serving", "zinc_100g"))),
    vit_a_mcg: vitA != null ? Math.round(vitA * 1_000_000) / 1000 : null, // OFF returns g
    vit_c_mg: vitC != null ? Math.round(vitC * 1000) : null,
    vit_d_mcg: vitD != null ? Math.round(vitD * 1_000_000) / 1000 : null,
  };

  // Round the macros for display sanity (per-100g values are often long decimals).
  for (const k of ["calories", "protein_g", "carbs_g", "fat_g", "fiber_g", "sugar_g", "sat_fat_g"] as const) {
    const v = nutrients[k];
    if (typeof v === "number") nutrients[k] = Math.round(v * 10) / 10;
  }

  return {
    id: `off_${p.code}`,
    source: "off",
    sourceId: p.code,
    upc: p.code,
    brand,
    name,
    servingSizeG: servingG,
    servingLabel,
    nutrients,
    createdAt: Date.now(),
  };
}

/**
 * OFF returns mineral fields in grams (per their docs). We need mg.
 * Heuristic: if the value is suspiciously large (> 5), assume mg already;
 * else multiply by 1000.
 */
function maybeMg(v: number | null): number | null {
  if (v == null) return null;
  if (v > 5) return v;
  return v * 1000;
}
function roundOrNull(v: number | null): number | null {
  if (v == null) return null;
  return Math.round(v);
}

export async function offGetByBarcode(upc: string): Promise<Food | null> {
  const url = `${OFF_BASE}/api/v2/product/${encodeURIComponent(upc)}.json`;
  const res = await fetch(url, {
    headers: { "user-agent": "fuel-tracker/0.1 (web)" },
    next: { revalidate: 60 * 60 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { status?: number; product?: OffProduct };
  if (data.status !== 1 || !data.product) return null;
  return offToFood(data.product);
}

export async function offSearch(query: string, page = 1, pageSize = 12): Promise<Food[]> {
  if (!query.trim()) return [];
  const url = `${OFF_BASE}/cgi/search.pl?search_terms=${encodeURIComponent(
    query,
  )}&search_simple=1&action=process&json=1&page_size=${pageSize}&page=${page}&fields=code,product_name,product_name_en,brands,serving_size,serving_quantity,nutriments`;
  const res = await fetch(url, {
    headers: { "user-agent": "fuel-tracker/0.1 (web)" },
    next: { revalidate: 60 * 5 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { products?: OffProduct[] };
  const products = data.products ?? [];
  return products
    .map(offToFood)
    .filter((f): f is Food => Boolean(f) && Boolean(f?.nutrients.calories));
}
