import type { Food } from "@/lib/types";
import { chainSeedToFood, CHAIN_SEEDS } from "./chains";
import { seedToFood, WHOLE_FOOD_SEEDS } from "./wholeFoods";

/** All curated foods exposed as Food shapes for search + display. */
export const CURATED_FOODS: Food[] = [
  ...WHOLE_FOOD_SEEDS.map(seedToFood),
  ...CHAIN_SEEDS.map(chainSeedToFood),
];

/**
 * Fuzzy-ish search over the curated catalog.
 *   - Match on name, brand, or any alias
 *   - Score: exact > prefix > word-prefix > substring
 *   - Tokenize the query so "cfa grilled nuggets 30" matches an item where
 *     "30 ct" appears in the portion label.
 */
export function curatedSearch(rawQuery: string, limit = 12): Food[] {
  const q = rawQuery.trim().toLowerCase();
  if (q.length < 2) return [];
  const tokens = q.split(/\s+/).filter(Boolean);

  const out: Array<{ food: Food; score: number }> = [];

  for (const food of CURATED_FOODS) {
    const haystacks: string[] = [
      food.name.toLowerCase(),
      (food.brand ?? "").toLowerCase(),
      food.servingLabel.toLowerCase(),
      ...(food.aliases ?? []).map((a) => a.toLowerCase()),
    ];
    const combined = haystacks.join(" | ");

    // every token must appear *somewhere* in the haystack
    if (!tokens.every((t) => combined.includes(t))) continue;

    let score = 0;
    const nameLower = food.name.toLowerCase();
    const brandLower = (food.brand ?? "").toLowerCase();

    if (nameLower === q) score -= 120;
    else if (`${brandLower} ${nameLower}`.startsWith(q)) score -= 90;
    else if (nameLower.startsWith(q)) score -= 70;
    else if (nameLower.includes(q)) score -= 40;
    if (brandLower.startsWith(q)) score -= 50;
    if (food.aliases?.some((a) => a.toLowerCase() === q)) score -= 110;

    // small length penalty so shorter names rank higher in ties
    score += Math.min(20, nameLower.length / 6);

    out.push({ food, score });
  }

  out.sort((a, b) => a.score - b.score);
  return out.slice(0, limit).map((x) => x.food);
}
