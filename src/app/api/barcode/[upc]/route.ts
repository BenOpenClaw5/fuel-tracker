import { NextResponse } from "next/server";
import { offGetByBarcode } from "@/lib/sources/off";
import { usdaSearch } from "@/lib/sources/usda";
import type { Food } from "@/lib/types";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ upc: string }>;
}

export async function GET(_req: Request, ctx: RouteContext) {
  const { upc } = await ctx.params;
  if (!/^\d{6,14}$/.test(upc)) {
    return NextResponse.json({ error: "Invalid barcode" }, { status: 400 });
  }
  try {
    const off = await offGetByBarcode(upc).catch(() => null);
    if (off) return NextResponse.json({ food: off, source: "off" });
    // Fallback: USDA branded search by UPC
    const usda = await usdaSearch(upc, 5).catch(() => []);
    const match = usda.find((f: Food) => f.upc === upc) ?? usda[0];
    if (match) return NextResponse.json({ food: match, source: "usda" });
    return NextResponse.json({ food: null }, { status: 404 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
