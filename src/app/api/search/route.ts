import { NextResponse } from "next/server";
import { curatedSearch } from "@/data";
import { offSearch } from "@/lib/sources/off";
import { usdaSearch } from "@/lib/sources/usda";
import type { Food } from "@/lib/types";

export const runtime = "nodejs";

/**
 * Normalize a product name so near-identical entries collapse:
 *   "Built Bar - Double Chocolate®" → "built bar double chocolate"
 * Strips punctuation, weight/qty noise, and filler words. Used for dedup and
 * for matching external results against the curated catalog.
 */
function normName(s: string): string {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ") // drop parentheticals
    .replace(/\b\d+(\.\d+)?\s?(g|kg|mg|oz|ml|l|lb|ct|count|pack|pk|fl)\b/g, " ") // weights/qty
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\b(the|a|an|with|of|and|in|original|brand|net|wt)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupeKey(f: Food): string {
  return `${(f.brand ?? "").toLowerCase().trim()}::${normName(f.name)}`;
}

/**
 * An external (USDA/OFF) result is only relevant if every query token appears
 * in its *name*. This is what kills the "search pork ribs, get random branded
 * snacks" problem — branded junk rarely contains all the query words by name.
 */
function isRelevant(food: Food, tokens: string[]): boolean {
  const name = food.name.toLowerCase();
  return tokens.every((t) => name.includes(t));
}

function scoreExternal(food: Food, q: string, isShortQuery: boolean): number {
  const name = food.name.toLowerCase();
  let s = 0;
  if (name === q) s -= 60;
  else if (name.startsWith(q + " ") || name.startsWith(q + ",")) s -= 30;
  else if (name.startsWith(q)) s -= 20;
  else if (name.includes(q)) s -= 5;
  s += Math.min(40, name.length / 3);
  // short generic queries ("pork ribs") want whole foods, not branded items
  if (isShortQuery && !food.brand) s -= 25;
  return s;
}

/** Bound a source call so one slow API can't stall the whole response. */
function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      },
    );
  });
}

interface SearchOk {
  results: Food[];
  errors?: Array<{ source: string; message: string }>;
}

const SOURCE_TIMEOUT_MS = 4000;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json<SearchOk>({ results: [] });
  }

  const ql = q.toLowerCase();
  const tokens = ql.split(/\s+/).filter(Boolean);
  const isShortQuery = tokens.length <= 2;
  const errors: Array<{ source: string; message: string }> = [];

  // Curated is in-memory, instant, never fails. It's also self-sorted with
  // alias support, so we trust its order and rank it first.
  const curated = curatedSearch(q, 18);

  const [whole, branded, off] = await Promise.all([
    withTimeout(
      usdaSearch(q, 10, "whole").catch((e: Error) => {
        errors.push({ source: "usda-whole", message: e.message });
        return [] as Food[];
      }),
      SOURCE_TIMEOUT_MS,
      [] as Food[],
    ),
    withTimeout(
      usdaSearch(q, 8, "branded").catch((e: Error) => {
        errors.push({ source: "usda-branded", message: e.message });
        return [] as Food[];
      }),
      SOURCE_TIMEOUT_MS,
      [] as Food[],
    ),
    withTimeout(
      offSearch(q, 1, 8).catch((e: Error) => {
        errors.push({ source: "off", message: e.message });
        return [] as Food[];
      }),
      SOURCE_TIMEOUT_MS,
      [] as Food[],
    ),
  ]);

  // Filter external down to relevant, non-duplicate entries. Seed the seen-set
  // with curated keys so external never echoes a curated item under a slightly
  // different name.
  const seen = new Set<string>(curated.map(dedupeKey));
  const seenUpc = new Set<string>(
    curated.map((f) => f.upc).filter(Boolean) as string[],
  );

  const acceptExternal = (list: Food[]): Food[] => {
    const out: Food[] = [];
    for (const f of list) {
      if (!isRelevant(f, tokens)) continue;
      if (f.nutrients.calories == null) continue;
      const key = dedupeKey(f);
      if (seen.has(key)) continue;
      if (f.upc && seenUpc.has(f.upc)) continue;
      seen.add(key);
      if (f.upc) seenUpc.add(f.upc);
      out.push(f);
    }
    return out.sort(
      (a, b) =>
        scoreExternal(a, ql, isShortQuery) - scoreExternal(b, ql, isShortQuery),
    );
  };

  const merged = [
    ...curated,
    ...acceptExternal(whole),
    ...acceptExternal(branded),
    ...acceptExternal(off),
  ];

  const body: SearchOk = { results: merged.slice(0, 36) };
  if (errors.length) body.errors = errors;
  return NextResponse.json(body);
}
