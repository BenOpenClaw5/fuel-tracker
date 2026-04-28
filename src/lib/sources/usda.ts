import type { Food, Nutrients } from "../types";

const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

interface UsdaNutrient {
  nutrientId?: number;
  nutrientName?: string;
  nutrientNumber?: string;
  unitName?: string;
  value?: number;
  amount?: number;
  derivationCode?: string;
}

interface UsdaFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  brandName?: string;
  gtinUpc?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  dataType?: string;
  foodNutrients?: UsdaNutrient[];
}

interface UsdaSearchResponse {
  totalHits?: number;
  foods?: UsdaFood[];
}

// FDC nutrient numbers we care about. (Standard ID set used by USDA.)
const N = {
  energy_kcal: ["208"],
  protein: ["203"],
  carbs: ["205"],
  fat: ["204"],
  fiber: ["291"],
  sugar: ["269"],
  added_sugar: ["539"],
  sat_fat: ["606"],
  trans_fat: ["605"],
  cholesterol: ["601"],
  sodium: ["307"],
  potassium: ["306"],
  calcium: ["301"],
  iron: ["303"],
  magnesium: ["304"],
  zinc: ["309"],
  selenium: ["317"],
  copper: ["312"],
  manganese: ["315"],
  phosphorus: ["305"],
  vit_a_rae: ["320"],
  vit_c: ["401"],
  vit_d: ["328"],
  vit_e: ["323"],
  vit_k: ["430"],
  vit_b1: ["404"],
  vit_b2: ["405"],
  vit_b3: ["406"],
  vit_b5: ["410"],
  vit_b6: ["415"],
  vit_b7: ["416"],
  vit_b9: ["417"],
  vit_b12: ["418"],
};

function nutrientValue(
  list: UsdaNutrient[] | undefined,
  ids: string[],
): number | null {
  if (!list) return null;
  for (const id of ids) {
    const hit = list.find(
      (n) => n.nutrientNumber === id || String(n.nutrientId) === id,
    );
    const v = hit?.value ?? hit?.amount;
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

/**
 * Compose a Food. USDA standard reference foods report nutrients per 100 g —
 * we scale to the household serving when present.
 *
 * For Branded foods, nutrients are typically per 100 g too (when
 * `dataType === "Branded"` and `labelNutrients` is absent).
 */
function usdaToFood(u: UsdaFood): Food | null {
  const per100 = (key: string[]) => nutrientValue(u.foodNutrients, key);
  const hasCalories = per100(N.energy_kcal);
  if (hasCalories == null) return null;

  const servingG =
    typeof u.servingSize === "number" && u.servingSizeUnit?.toLowerCase().includes("g")
      ? u.servingSize
      : 100;
  const factor = servingG / 100;

  const scale = (v: number | null) => (v == null ? null : Math.round(v * factor * 100) / 100);

  const nutrients: Nutrients = {
    calories: scale(hasCalories),
    protein_g: scale(per100(N.protein)),
    carbs_g: scale(per100(N.carbs)),
    fat_g: scale(per100(N.fat)),
    fiber_g: scale(per100(N.fiber)),
    sugar_g: scale(per100(N.sugar)),
    added_sugar_g: scale(per100(N.added_sugar)),
    sat_fat_g: scale(per100(N.sat_fat)),
    trans_fat_g: scale(per100(N.trans_fat)),
    cholesterol_mg: scale(per100(N.cholesterol)),
    sodium_mg: scale(per100(N.sodium)),
    potassium_mg: scale(per100(N.potassium)),
    calcium_mg: scale(per100(N.calcium)),
    iron_mg: scale(per100(N.iron)),
    magnesium_mg: scale(per100(N.magnesium)),
    zinc_mg: scale(per100(N.zinc)),
    selenium_mcg: scale(per100(N.selenium)),
    copper_mg: scale(per100(N.copper)),
    manganese_mg: scale(per100(N.manganese)),
    phosphorus_mg: scale(per100(N.phosphorus)),
    vit_a_mcg: scale(per100(N.vit_a_rae)),
    vit_c_mg: scale(per100(N.vit_c)),
    vit_d_mcg: scale(per100(N.vit_d)),
    vit_e_mg: scale(per100(N.vit_e)),
    vit_k_mcg: scale(per100(N.vit_k)),
    vit_b1_mg: scale(per100(N.vit_b1)),
    vit_b2_mg: scale(per100(N.vit_b2)),
    vit_b3_mg: scale(per100(N.vit_b3)),
    vit_b5_mg: scale(per100(N.vit_b5)),
    vit_b6_mg: scale(per100(N.vit_b6)),
    vit_b7_mcg: scale(per100(N.vit_b7)),
    vit_b9_mcg: scale(per100(N.vit_b9)),
    vit_b12_mcg: scale(per100(N.vit_b12)),
  };

  const householdLabel = u.householdServingFullText?.trim();
  const servingLabel = householdLabel
    ? `${householdLabel}${servingG !== 100 ? ` (${servingG} g)` : ""}`
    : `${servingG} g`;

  const brand = u.brandOwner || u.brandName || undefined;

  return {
    id: `usda_${u.fdcId}`,
    source: "usda",
    sourceId: String(u.fdcId),
    upc: u.gtinUpc || undefined,
    brand,
    name: u.description,
    servingSizeG: servingG,
    servingLabel,
    nutrients,
    createdAt: Date.now(),
  };
}

function getKey(): string {
  return process.env.USDA_API_KEY || "DEMO_KEY";
}

export async function usdaSearch(query: string, pageSize = 12): Promise<Food[]> {
  if (!query.trim()) return [];
  const url = `${USDA_BASE}/foods/search?api_key=${getKey()}&query=${encodeURIComponent(
    query,
  )}&pageSize=${pageSize}&dataType=${encodeURIComponent("Foundation,SR Legacy,Branded")}`;
  const res = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!res.ok) return [];
  const data = (await res.json()) as UsdaSearchResponse;
  return (data.foods ?? [])
    .map(usdaToFood)
    .filter((f): f is Food => Boolean(f));
}

export async function usdaGetById(fdcId: string): Promise<Food | null> {
  const url = `${USDA_BASE}/food/${encodeURIComponent(fdcId)}?api_key=${getKey()}`;
  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
  if (!res.ok) return null;
  const data = (await res.json()) as UsdaFood;
  return usdaToFood(data);
}
