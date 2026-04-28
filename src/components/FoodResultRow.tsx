"use client";

import { Star } from "lucide-react";
import type { Food } from "@/lib/types";

export function FoodResultRow({
  food,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: {
  food: Food;
  isFavorite?: boolean;
  onSelect: () => void;
  onToggleFavorite?: () => void;
}) {
  const cal = food.nutrients.calories;
  const p = food.nutrients.protein_g;
  const c = food.nutrients.carbs_g;
  const f = food.nutrients.fat_g;
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 active:bg-[var(--panel-2)] cursor-pointer">
      <button type="button" onClick={onSelect} className="text-left min-w-0">
        <div className="text-[14.5px] font-medium leading-tight truncate">
          {food.name}
        </div>
        <div className="text-[12px] text-[var(--muted)] truncate mt-0.5">
          {food.brand ? `${food.brand} · ` : ""}
          <span className="numeric">{food.servingLabel}</span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-[var(--fg-dim)]">
          <span className="numeric">
            {cal != null ? Math.round(cal) : "—"} kcal
          </span>
          <span className="numeric">{p != null ? Math.round(p) : "—"}P</span>
          <span className="numeric">{c != null ? Math.round(c) : "—"}C</span>
          <span className="numeric">{f != null ? Math.round(f) : "—"}F</span>
          <SourcePill source={food.source} />
        </div>
      </button>
      {onToggleFavorite ? (
        <button
          type="button"
          aria-label={isFavorite ? "Unfavorite" : "Favorite"}
          onClick={onToggleFavorite}
          className="p-2 text-[var(--muted)] hover:text-[var(--accent)]"
        >
          <Star
            size={16}
            strokeWidth={2}
            fill={isFavorite ? "var(--accent)" : "transparent"}
            color={isFavorite ? "var(--accent)" : "currentColor"}
          />
        </button>
      ) : null}
    </div>
  );
}

function SourcePill({ source }: { source: Food["source"] }) {
  const label =
    source === "off"
      ? "OFF"
      : source === "usda"
        ? "USDA"
        : source === "user"
          ? "Mine"
          : source.toUpperCase();
  return (
    <span
      className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[3px] border"
      style={{
        color: "var(--muted)",
        borderColor: "var(--border)",
        background: "var(--panel-2)",
      }}
    >
      {label}
    </span>
  );
}
