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

function pickServing<K extends keyof OffNutriments>(
  n: OffNutriments | undefined,
  servingKey: K,
  per100Key: K,
  servingG: number | undefined,
): number | null {
  if (!n) return null;
  const direct = n[servingKey];
  if (typeof direct === "number" && Number.isFinite(direct)) return direct;
  const per100 = n[per100Key];
  if (typeof per100 === "number" && Number.isFinite(per100) && servingG && servingG > 0) {
    return (per100 * servingG) / 100;
  }
  return null;
}

function offToFood(p: OffProduct): Food | null {
  if (!p.code) return null;
  const name = p.product_name_en || p.product_name || "Unnamed product";
  const brand = (p.brands || "").split(",")[0]?.trim() || undefined;
  const servingG = p.serving_quantity ? Number(p.serving_quantity) : 0;
  const servingLabel = p.serving_size || (servingG ? `${servingG} g` : "1 serving");

  const n = p.nutriments;
  // Convert OFF sodium (g) to mg if present in grams
  let sodium_mg: number | null = null;
  const sodiumS = pickServing(n, "sodium_serving", "sodium_100g", servingG);
  if (sodiumS != null) sodium_mg = Math.round(sodiumS * 1000);

  let cholesterol_mg: number | null = null;
  const cholS = pickServing(n, "cholesterol_serving", "cholesterol_100g", servingG);
  if (cholS != null) cholesterol_mg = Math.round(cholS * 1000);

  // Vitamin A in OFF is reported in µg (RAE) at vitamin-a_serving
  const vitA = pickServing(n, "vitamin-a_serving", "vitamin-a_100g", servingG);
  const vitC = pickServing(n, "vitamin-c_serving", "vitamin-c_100g", servingG);
  const vitD = pickServing(n, "vitamin-d_serving", "vitamin-d_100g", servingG);

  const nutrients: Nutrients = {
    calories:
      pickServing(n, "energy-kcal_serving", "energy-kcal_100g", servingG) ?? null,
    protein_g: pickServing(n, "proteins_serving", "proteins_100g", servingG),
    carbs_g: pickServing(n, "carbohydrates_serving", "carbohydrates_100g", servingG),
    fat_g: pickServing(n, "fat_serving", "fat_100g", servingG),
    fiber_g: pickServing(n, "fiber_serving", "fiber_100g", servingG),
    sugar_g: pickServing(n, "sugars_serving", "sugars_100g", servingG),
    sat_fat_g: pickServing(n, "saturated-fat_serving", "saturated-fat_100g", servingG),
    trans_fat_g: pickServing(n, "trans-fat_serving", "trans-fat_100g", servingG),
    cholesterol_mg,
    sodium_mg,
    potassium_mg: roundOrNull(
      maybeMg(pickServing(n, "potassium_serving", "potassium_100g", servingG)),
    ),
    calcium_mg: roundOrNull(
      maybeMg(pickServing(n, "calcium_serving", "calcium_100g", servingG)),
    ),
    iron_mg: roundOrNull(
      maybeMg(pickServing(n, "iron_serving", "iron_100g", servingG)),
    ),
    magnesium_mg: roundOrNull(
      maybeMg(pickServing(n, "magnesium_serving", "magnesium_100g", servingG)),
    ),
    zinc_mg: roundOrNull(
      maybeMg(pickServing(n, "zinc_serving", "zinc_100g", servingG)),
    ),
    vit_a_mcg: vitA != null ? Math.round(vitA * 1_000_000) / 1000 : null, // OFF returns g
    vit_c_mg: vitC != null ? Math.round(vitC * 1000) : null,
    vit_d_mcg: vitD != null ? Math.round(vitD * 1_000_000) / 1000 : null,
  };

  return {
    id: `off_${p.code}`,
    source: "off",
    sourceId: p.code,
    upc: p.code,
    brand,
    name,
    servingSizeG: servingG || 100,
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
