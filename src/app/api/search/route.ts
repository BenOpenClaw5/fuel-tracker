import { NextResponse } from "next/server";
import { offSearch } from "@/lib/sources/off";
import { usdaSearch } from "@/lib/sources/usda";
import type { Food } from "@/lib/types";

export const runtime = "nodejs";

function dedupe(list: Food[]): Food[] {
  const seen = new Set<string>();
  const seenUpc = new Set<string>();
  const out: Food[] = [];
  for (const f of list) {
    const key = `${(f.brand ?? "").toLowerCase()}::${f.name.toLowerCase()}`;
    if (seen.has(key)) continue;
    if (f.upc && seenUpc.has(f.upc)) continue;
    seen.add(key);
    if (f.upc) seenUpc.add(f.upc);
    out.push(f);
  }
  return out;
}

/**
 * Score a result for a query. Lower score = closer to what the user wants.
 *  - exact match starts at 0
 *  - prefix match shorter than non-match
 *  - whole-food (no brand) outranks branded items for short queries
 */
function score(food: Food, query: string, isShortQuery: boolean): number {
  const name = food.name.toLowerCase();
  const q = query.toLowerCase();
  let s = 0;
  if (name === q) s -= 60;
  else if (name.startsWith(q + " ") || name.startsWith(q + ",")) s -= 30;
  else if (name.startsWith(q)) s -= 20;
  else if (name.includes(q)) s -= 5;

  // Reward shorter names — generic whole foods are usually shorter
  s += Math.min(40, name.length / 3);

  // Strongly prefer non-branded results for short queries
  if (isShortQuery && !food.brand) s -= 25;

  return s;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ results: [] });

  const isShortQuery = q.split(/\s+/).filter(Boolean).length <= 2;

  try {
    const [whole, branded, off] = await Promise.all([
      usdaSearch(q, 14, "whole").catch(() => []),
      usdaSearch(q, 10, "branded").catch(() => []),
      offSearch(q, 1, 8).catch(() => []),
    ]);

    // Sort each bucket independently
    const sortBucket = (list: Food[]) =>
      list.slice().sort((a, b) => score(a, q, isShortQuery) - score(b, q, isShortQuery));

    const merged = [
      ...sortBucket(whole), // whole foods first
      ...sortBucket(branded),
      ...sortBucket(off),
    ];

    return NextResponse.json({ results: dedupe(merged).slice(0, 30) });
  } catch (e) {
    return NextResponse.json(
      { results: [], error: (e as Error).message },
      { status: 500 },
    );
  }
}
