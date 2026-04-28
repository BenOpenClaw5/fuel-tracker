import { NextResponse } from "next/server";
import { offSearch } from "@/lib/sources/off";
import { usdaSearch } from "@/lib/sources/usda";
import type { Food } from "@/lib/types";

export const runtime = "nodejs";

function dedupe(list: Food[]): Food[] {
  const seen = new Set<string>();
  const out: Food[] = [];
  for (const f of list) {
    const key = `${f.brand ?? ""}::${f.name}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return out;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }
  try {
    const [usda, off] = await Promise.all([
      usdaSearch(q, 12).catch(() => []),
      offSearch(q, 1, 12).catch(() => []),
    ]);
    // Interleave: USDA first (cleaner data), OFF second
    const interleaved: Food[] = [];
    const max = Math.max(usda.length, off.length);
    for (let i = 0; i < max; i++) {
      if (usda[i]) interleaved.push(usda[i]);
      if (off[i]) interleaved.push(off[i]);
    }
    return NextResponse.json({ results: dedupe(interleaved).slice(0, 24) });
  } catch (e) {
    return NextResponse.json(
      { results: [], error: (e as Error).message },
      { status: 500 },
    );
  }
}
