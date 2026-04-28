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

function score(food: Food, query: string, isShortQuery: boolean): number {
  const name = food.name.toLowerCase();
  const q = query.toLowerCase();
  let s = 0;
  if (name === q) s -= 60;
  else if (name.startsWith(q + " ") || name.startsWith(q + ",")) s -= 30;
  else if (name.startsWith(q)) s -= 20;
  else if (name.includes(q)) s -= 5;
  s += Math.min(40, name.length / 3);
  if (isShortQuery && !food.brand) s -= 25;
  return s;
}

interface SearchOk {
  results: Food[];
  errors?: Array<{ source: string; message: string }>;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json<SearchOk>({ results: [] });
  }

  const isShortQuery = q.split(/\s+/).filter(Boolean).length <= 2;
  const errors: Array<{ source: string; message: string }> = [];

  // Run all three in parallel; degrade gracefully on any failure.
  const [whole, branded, off] = await Promise.all([
    usdaSearch(q, 14, "whole").catch((e: Error) => {
      errors.push({ source: "usda-whole", message: e.message });
      return [] as Food[];
    }),
    usdaSearch(q, 10, "branded").catch((e: Error) => {
      errors.push({ source: "usda-branded", message: e.message });
      return [] as Food[];
    }),
    offSearch(q, 1, 8).catch((e: Error) => {
      errors.push({ source: "off", message: e.message });
      return [] as Food[];
    }),
  ]);

  const sortBucket = (list: Food[]) =>
    list.slice().sort((a, b) => score(a, q, isShortQuery) - score(b, q, isShortQuery));

  const merged = [...sortBucket(whole), ...sortBucket(branded), ...sortBucket(off)];
  const body: SearchOk = { results: dedupe(merged).slice(0, 30) };
  if (errors.length) body.errors = errors;
  return NextResponse.json(body);
}
