"use client";

import { useRef, useState } from "react";
import { Download, Trash2, Upload, Sun, Moon, Monitor } from "lucide-react";
import { Logo } from "@/components/Logo";
import { showToast } from "@/components/ToastHost";
import { useGoals, useProfile, useSettings } from "@/lib/hooks";
import {
  exportAll,
  importAll,
  nukeAll,
  saveGoals,
  saveProfile,
  saveSettings,
} from "@/lib/storage";
import { buildGoals, kgToLbs, lbsToKg } from "@/lib/nutrition";
import type { ActivityLevel, Goal, Goals, Sex, ThemeChoice, Units } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const settings = useSettings();
  const profile = useProfile();
  const goals = useGoals();
  const fileRef = useRef<HTMLInputElement>(null);
  const [recompute, setRecompute] = useState(false);

  if (!profile || !goals) return null;

  const setTheme = (t: ThemeChoice) => saveSettings({ ...settings, theme: t });
  const setUnits = (u: Units) => {
    saveSettings({ ...settings, units: u });
    // eslint-disable-next-line react-hooks/purity -- event handler, not render
    saveProfile({ ...profile, units: u, updatedAt: Date.now() });
  };

  const updateProfile = (patch: Partial<typeof profile>) => {
    saveProfile({ ...profile, ...patch, updatedAt: Date.now() });
    setRecompute(true);
  };

  const updateGoals = (patch: Partial<Goals>) =>
    saveGoals({ ...goals, ...patch });

  const recomputeFromProfile = () => {
    const fresh = buildGoals({ ...profile, updatedAt: Date.now() });
    saveGoals({ ...fresh, ...goals, calories: fresh.calories, protein_g: fresh.protein_g, carbs_g: fresh.carbs_g, fat_g: fresh.fat_g });
    showToast("Targets recalculated", "success");
    setRecompute(false);
  };

  const isImperial = profile.units === "imperial";

  const doExport = () => {
    const data = exportAll();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fuel-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported", "success");
  };
  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      importAll(text);
      showToast("Imported", "success");
    } catch (err) {
      showToast(`Import failed: ${(err as Error).message}`, "error");
    } finally {
      e.target.value = "";
    }
  };
  const confirmNuke = () => {
    if (!window.confirm("Delete ALL data? This cannot be undone.")) return;
    nukeAll();
    router.replace("/onboarding");
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-5 pt-6 pb-3 safe-top flex items-center justify-between">
        <Logo size={18} />
        <div className="label">Settings</div>
      </header>

      <div className="px-5 pb-2">
        <h1 className="display-xl">Settings</h1>
      </div>

      <div className="px-5 grid gap-4 max-w-[760px] w-full mx-auto pb-8">
        <section className="card p-4">
          <div className="label-strong mb-3">Appearance</div>
          <div className="grid grid-cols-3 p-1 bg-[var(--panel-2)] rounded-[var(--radius)] border border-[var(--border)] gap-1">
            {(
              [
                { v: "system" as ThemeChoice, label: "System", icon: Monitor },
                { v: "light" as ThemeChoice, label: "Light", icon: Sun },
                { v: "dark" as ThemeChoice, label: "Dark", icon: Moon },
              ] as const
            ).map((t) => (
              <button
                key={t.v}
                type="button"
                onClick={() => setTheme(t.v)}
                className={
                  "h-10 rounded-[6px] text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5 " +
                  (settings.theme === t.v
                    ? "bg-[var(--panel)] shadow-[var(--shadow-sm)] text-[var(--fg)]"
                    : "text-[var(--fg-dim)]")
                }
              >
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>
        </section>

        <section className="card p-4">
          <div className="label-strong mb-3">Units</div>
          <div className="grid grid-cols-2 p-1 bg-[var(--panel-2)] rounded-[var(--radius)] border border-[var(--border)] gap-1">
            {(["imperial", "metric"] as Units[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnits(u)}
                className={
                  "h-10 rounded-[6px] text-[12px] font-semibold transition-colors " +
                  (settings.units === u
                    ? "bg-[var(--panel)] shadow-[var(--shadow-sm)] text-[var(--fg)]"
                    : "text-[var(--fg-dim)]")
                }
              >
                {u === "imperial" ? "lb / ft" : "kg / cm"}
              </button>
            ))}
          </div>
        </section>

        <section className="card p-4">
          <div className="label-strong mb-3">Body</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sex">
              <select
                value={profile.sex}
                onChange={(e) => updateProfile({ sex: e.target.value as Sex })}
              >
                <option value="m">Male</option>
                <option value="f">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Date of birth">
              <input
                type="date"
                value={profile.birthDate ?? ""}
                onChange={(e) => updateProfile({ birthDate: e.target.value })}
              />
            </Field>
            <Field label={`Height (${isImperial ? "in" : "cm"})`}>
              <input
                type="number"
                value={
                  isImperial
                    ? Math.round(profile.heightCm / 2.54)
                    : Math.round(profile.heightCm)
                }
                onChange={(e) => {
                  const v = Number(e.target.value) || 0;
                  const heightCm = isImperial ? v * 2.54 : v;
                  updateProfile({ heightCm });
                }}
              />
            </Field>
            <Field label={`Weight (${isImperial ? "lb" : "kg"})`}>
              <input
                type="number"
                step="0.1"
                value={
                  isImperial
                    ? Math.round(kgToLbs(profile.weightKg) * 10) / 10
                    : Math.round(profile.weightKg * 10) / 10
                }
                onChange={(e) => {
                  const v = Number(e.target.value) || 0;
                  const weightKg = isImperial ? lbsToKg(v) : v;
                  updateProfile({ weightKg });
                }}
              />
            </Field>
            <Field label="Activity">
              <select
                value={profile.activityLevel}
                onChange={(e) =>
                  updateProfile({ activityLevel: e.target.value as ActivityLevel })
                }
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="very">Very active</option>
                <option value="extreme">Extreme</option>
              </select>
            </Field>
            <Field label="Goal">
              <select
                value={profile.goal}
                onChange={(e) => updateProfile({ goal: e.target.value as Goal })}
              >
                <option value="cut">Cut</option>
                <option value="maintain">Maintain</option>
                <option value="bulk">Bulk</option>
              </select>
            </Field>
          </div>
          {recompute ? (
            <button
              type="button"
              onClick={recomputeFromProfile}
              className="btn btn-info btn-sm mt-3 w-full"
            >
              Recalculate calorie + macro targets
            </button>
          ) : null}
        </section>

        <section className="card p-4">
          <div className="label-strong mb-3">Daily targets</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Calories">
              <input
                type="number"
                value={goals.calories}
                onChange={(e) =>
                  updateGoals({ calories: Math.max(0, Number(e.target.value) || 0) })
                }
              />
            </Field>
            <Field label="Water (ml)">
              <input
                type="number"
                value={goals.water_ml ?? 2500}
                onChange={(e) =>
                  updateGoals({ water_ml: Math.max(0, Number(e.target.value) || 0) })
                }
              />
            </Field>
            <Field label="Protein (g)">
              <input
                type="number"
                value={goals.protein_g}
                onChange={(e) =>
                  updateGoals({ protein_g: Math.max(0, Number(e.target.value) || 0) })
                }
              />
            </Field>
            <Field label="Carbs (g)">
              <input
                type="number"
                value={goals.carbs_g}
                onChange={(e) =>
                  updateGoals({ carbs_g: Math.max(0, Number(e.target.value) || 0) })
                }
              />
            </Field>
            <Field label="Fat (g)">
              <input
                type="number"
                value={goals.fat_g}
                onChange={(e) =>
                  updateGoals({ fat_g: Math.max(0, Number(e.target.value) || 0) })
                }
              />
            </Field>
            <Field label="Fiber (g)">
              <input
                type="number"
                value={goals.fiber_g ?? 0}
                onChange={(e) =>
                  updateGoals({ fiber_g: Math.max(0, Number(e.target.value) || 0) })
                }
              />
            </Field>
          </div>
        </section>

        <section className="card p-4">
          <div className="label-strong mb-3">Data</div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={doExport} className="btn">
              <Download size={14} /> Export
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="btn"
            >
              <Upload size={14} /> Import
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={onImport}
            className="sr-only"
          />
          <button
            type="button"
            onClick={confirmNuke}
            className="btn mt-3 w-full !border-[var(--danger)] !text-[var(--danger)] hover:!bg-[var(--danger)] hover:!text-white"
          >
            <Trash2 size={14} /> Reset everything
          </button>
        </section>

        <p className="text-center text-[12px] text-[var(--muted)] py-2">
          FUEL · PHASE 1 · LOCAL ONLY
        </p>
      </div>
    </div>
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
