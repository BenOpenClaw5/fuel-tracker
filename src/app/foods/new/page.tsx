"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Save } from "lucide-react";
import { newId } from "@/lib/dates";
import { upsertFood } from "@/lib/storage";
import { showToast } from "@/components/ToastHost";
import { NUTRIENT_META } from "@/lib/nutrients";
import type { Food, Nutrients } from "@/lib/types";

type Form = {
  name: string;
  brand: string;
  servingLabel: string;
  servingSizeG: string;
  values: Record<string, string>;
};

function emptyForm(): Form {
  return {
    name: "",
    brand: "",
    servingLabel: "1 serving",
    servingSizeG: "100",
    values: {},
  };
}

export default function NewFoodPage() {
  const router = useRouter();
  const [form, setForm] = useState<Form>(emptyForm());
  const [showMicros, setShowMicros] = useState(false);

  const setVal = (key: string, v: string) =>
    setForm((f) => ({ ...f, values: { ...f.values, [key]: v } }));

  const submit = () => {
    if (!form.name.trim()) {
      showToast("Name required", "error");
      return;
    }
    const nutrients: Nutrients = {
      calories: null,
      protein_g: null,
      carbs_g: null,
      fat_g: null,
    };
    for (const m of NUTRIENT_META) {
      const raw = form.values[m.key as string];
      if (raw == null || raw === "") {
        // null for unknown for non-macros; macros default to 0
        if (m.group === "macro" && (m.key === "calories" || m.key === "protein_g" || m.key === "carbs_g" || m.key === "fat_g")) {
          (nutrients as unknown as Record<string, number | null>)[m.key as string] = 0;
        } else {
          (nutrients as unknown as Record<string, number | null>)[m.key as string] = null;
        }
        continue;
      }
      const n = Number(raw);
      (nutrients as unknown as Record<string, number | null>)[m.key as string] = Number.isFinite(n)
        ? n
        : null;
    }

    const food: Food = {
      id: newId("user"),
      source: "user",
      name: form.name.trim(),
      brand: form.brand.trim() || undefined,
      servingLabel: form.servingLabel.trim() || "1 serving",
      servingSizeG: Math.max(1, Number(form.servingSizeG) || 100),
      nutrients,
      createdAt: Date.now(),
    };
    upsertFood(food);
    showToast("Food saved", "success");
    router.back();
  };

  const macros = NUTRIENT_META.filter((m) => m.group === "macro");
  const fats = NUTRIENT_META.filter((m) => m.group === "fats");
  const minerals = NUTRIENT_META.filter((m) => m.group === "minerals");
  const vitamins = NUTRIENT_META.filter((m) => m.group === "vitamins");

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-10 bar-top safe-top">
        <div className="px-3 pt-3 pb-3 grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm !min-h-[36px] !px-2"
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="text-center text-[13px] font-semibold">New custom food</div>
          <button
            type="button"
            onClick={submit}
            className="btn btn-primary btn-sm"
          >
            <Save size={14} /> Save
          </button>
        </div>
      </header>

      <div className="flex-1 px-5 py-5 max-w-[640px] w-full mx-auto grid gap-4">
        <section className="card p-4">
          <div className="grid gap-3">
            <Field label="Name">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Grandma's chicken parm"
                autoCapitalize="sentences"
              />
            </Field>
            <Field label="Brand (optional)">
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="Homemade"
                autoCapitalize="words"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Serving label">
                <input
                  type="text"
                  value={form.servingLabel}
                  onChange={(e) => setForm({ ...form, servingLabel: e.target.value })}
                  placeholder="1 cup (240 g)"
                />
              </Field>
              <Field label="Serving size (g)">
                <input
                  type="number"
                  value={form.servingSizeG}
                  onChange={(e) => setForm({ ...form, servingSizeG: e.target.value })}
                  min={1}
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="card p-4">
          <div className="label mb-3">Macros — required</div>
          <div className="grid grid-cols-2 gap-3">
            {macros.slice(0, 4).map((m) => (
              <NutrientField
                key={m.key}
                meta={m}
                value={form.values[m.key as string] ?? ""}
                onChange={(v) => setVal(m.key as string, v)}
                required
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {macros.slice(4).map((m) => (
              <NutrientField
                key={m.key}
                meta={m}
                value={form.values[m.key as string] ?? ""}
                onChange={(v) => setVal(m.key as string, v)}
              />
            ))}
          </div>
        </section>

        <section className="card p-4">
          <button
            type="button"
            onClick={() => setShowMicros((v) => !v)}
            className="w-full flex items-center justify-between"
          >
            <div className="label-strong">Full nutrient panel (optional)</div>
            {showMicros ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showMicros ? (
            <div className="mt-4 grid gap-5">
              <NutrientGroup title="Fats">
                {fats.map((m) => (
                  <NutrientField
                    key={m.key}
                    meta={m}
                    value={form.values[m.key as string] ?? ""}
                    onChange={(v) => setVal(m.key as string, v)}
                  />
                ))}
              </NutrientGroup>
              <NutrientGroup title="Minerals">
                {minerals.map((m) => (
                  <NutrientField
                    key={m.key}
                    meta={m}
                    value={form.values[m.key as string] ?? ""}
                    onChange={(v) => setVal(m.key as string, v)}
                  />
                ))}
              </NutrientGroup>
              <NutrientGroup title="Vitamins">
                {vitamins.map((m) => (
                  <NutrientField
                    key={m.key}
                    meta={m}
                    value={form.values[m.key as string] ?? ""}
                    onChange={(v) => setVal(m.key as string, v)}
                  />
                ))}
              </NutrientGroup>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function NutrientGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="label mb-2">{title}</div>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function NutrientField({
  meta,
  value,
  onChange,
  required,
}: {
  meta: { key: string; label: string; unit: string };
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="label mb-1.5">
        {meta.label}
        {required ? <span className="text-[var(--accent)]"> *</span> : null}
      </div>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="!min-h-[44px] !text-[14px]"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--muted)] pointer-events-none">
          {meta.unit === "kcal" ? "kcal" : meta.unit === "mcg" ? "µg" : meta.unit}
        </span>
      </div>
    </label>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="label mb-1.5">{label}</div>
      {children}
    </label>
  );
}
