export type Sex = "m" | "f" | "other";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "very" | "extreme";
export type Goal = "cut" | "maintain" | "bulk";
export type Units = "imperial" | "metric";
export type Meal = "breakfast" | "lunch" | "dinner" | "snacks";
export type ThemeChoice = "system" | "light" | "dark";

export interface Profile {
  displayName?: string;
  units: Units;
  sex: Sex;
  birthDate?: string; // ISO date YYYY-MM-DD
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  createdAt: number;
  updatedAt: number;
}

/**
 * All nutrient amounts are per ONE serving of the food.
 * Values are absolute (g, mg, mcg). Use null for "unknown" — never 0.
 */
export interface Nutrients {
  // macros
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;

  // macro detail
  fiber_g?: number | null;
  sugar_g?: number | null;
  added_sugar_g?: number | null;
  sat_fat_g?: number | null;
  trans_fat_g?: number | null;
  cholesterol_mg?: number | null;

  // minerals
  sodium_mg?: number | null;
  potassium_mg?: number | null;
  calcium_mg?: number | null;
  iron_mg?: number | null;
  magnesium_mg?: number | null;
  zinc_mg?: number | null;
  selenium_mcg?: number | null;
  copper_mg?: number | null;
  manganese_mg?: number | null;
  phosphorus_mg?: number | null;

  // vitamins
  vit_a_mcg?: number | null;
  vit_c_mg?: number | null;
  vit_d_mcg?: number | null;
  vit_e_mg?: number | null;
  vit_k_mcg?: number | null;
  vit_b1_mg?: number | null;
  vit_b2_mg?: number | null;
  vit_b3_mg?: number | null;
  vit_b5_mg?: number | null;
  vit_b6_mg?: number | null;
  vit_b7_mcg?: number | null;
  vit_b9_mcg?: number | null;
  vit_b12_mcg?: number | null;

  // fats detail
  omega3_g?: number | null;
  omega6_g?: number | null;
}

export type FoodSource =
  | "off"
  | "usda"
  | "user"
  | "chain"
  | "nutritionix"
  | "curated"
  | "ai";

/**
 * A way to express how much of a food the user is eating.
 *   { label: "3 oz (85 g)", grams: 85 }
 *   { label: "1 chicken breast (174 g)", grams: 174 }
 *   { label: "1 tbsp", grams: 21 }
 */
export interface ServingOption {
  label: string;
  grams: number;
}

export interface Food {
  id: string;
  source: FoodSource;
  sourceId?: string; // external id (UPC, FDC ID)
  brand?: string;
  name: string;
  /** Grams equivalent of one "default" serving — nutrients are per this amount. */
  servingSizeG: number;
  /** Human label for the default serving e.g. "1 cup (240 g)". */
  servingLabel: string;
  servingsPerContainer?: number;
  upc?: string;
  /**
   * Optional alternate serving sizes. When present, the AddEntrySheet shows a
   * dropdown to let the user pick by oz, gram, cup, "1 medium", etc. The
   * first entry is treated as the default.
   */
  servingOptions?: ServingOption[];
  /** Tags for filtering/aliases. */
  aliases?: string[];
  nutrients: Nutrients;
  createdAt: number;
}

export type Goals = {
  // Macros — required
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;

  // Optional micronutrient targets (filled from RDA defaults at onboarding)
  fiber_g?: number;
  sugar_g?: number;
  added_sugar_g?: number;
  sat_fat_g?: number;
  trans_fat_g?: number;
  cholesterol_mg?: number;
  sodium_mg?: number;
  potassium_mg?: number;
  calcium_mg?: number;
  iron_mg?: number;
  magnesium_mg?: number;
  zinc_mg?: number;
  phosphorus_mg?: number;
  vit_a_mcg?: number;
  vit_c_mg?: number;
  vit_d_mcg?: number;
  vit_e_mg?: number;
  vit_k_mcg?: number;
  vit_b1_mg?: number;
  vit_b2_mg?: number;
  vit_b3_mg?: number;
  vit_b6_mg?: number;
  vit_b9_mcg?: number;
  vit_b12_mcg?: number;
  water_ml?: number;
};

export interface LogEntry {
  id: string;
  date: string; // ISO YYYY-MM-DD
  meal: Meal;
  /** foodId for a single Food, or recipeId when this entry is a saved recipe */
  foodId: string;
  /** Optional pointer to the source recipe for filtering */
  recipeId?: string;
  servings: number;
  /** Snapshot at log time so future food/recipe edits don't rewrite history */
  snapshot: {
    name: string;
    brand?: string;
    servingLabel: string;
    nutrients: Nutrients;
    isRecipe?: boolean;
  };
  createdAt: number;
}

export interface WeightLog {
  date: string;
  weightKg: number;
  createdAt: number;
}

export interface WaterLog {
  date: string;
  ml: number;
  updatedAt: number;
}

export interface AppSettings {
  theme: ThemeChoice;
  units: Units;
}

export interface RecipeItem {
  foodId: string;
  servings: number;
  // snapshot fields keep recipe nutrition stable even if the source food
  // changes or the user nukes the food cache
  cachedName: string;
  cachedBrand?: string;
  cachedServingLabel: string;
  cachedNutrients: Nutrients;
}

export interface Recipe {
  id: string;
  name: string;
  servings: number; // total servings the recipe makes
  notes?: string;
  items: RecipeItem[];
  createdAt: number;
  updatedAt: number;
}
