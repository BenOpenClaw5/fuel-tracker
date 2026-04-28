"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "@/components/Logo";
import { buildGoals, cmToFeetInches, feetInchesToCm, kgToLbs, lbsToKg } from "@/lib/nutrition";
import {
  markOnboarded,
  saveGoals,
  saveProfile,
  saveSettings,
  loadSettings,
} from "@/lib/storage";
import type {
  ActivityLevel,
  Goal,
  Goals,
  Profile,
  Sex,
  Units,
} from "@/lib/types";

type Step = 0 | 1 | 2 | 3 | 4;

interface Draft {
  units: Units;
  sex: Sex;
  birthDate: string;
  heightFt: number;
  heightIn: number;
  heightCm: number;
  weightLb: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export default function OnboardingPage() {
  const router = useRouter();
  const settings = loadSettings();
  const [step, setStep] = useState<Step>(0);
  const [draft, setDraft] = useState<Draft>(() => ({
    units: settings.units,
    sex: "m",
    birthDate: "1995-01-01",
    heightFt: 5,
    heightIn: 10,
    heightCm: feetInchesToCm(5, 10),
    weightLb: 175,
    weightKg: lbsToKg(175),
    activityLevel: "moderate",
    goal: "maintain",
  }));
  const [goalsPreview, setGoalsPreview] = useState<Goals | null>(null);

  const next = () => setStep((s) => (Math.min(4, s + 1) as Step));
  const back = () => setStep((s) => (Math.max(0, s - 1) as Step));

  const computeGoals = () => {
    const profile: Profile = makeProfile(draft);
    setGoalsPreview(buildGoals(profile));
  };

  const finish = (goals: Goals) => {
    const profile = makeProfile(draft);
    saveSettings({ ...settings, units: draft.units });
    saveProfile(profile);
    saveGoals(goals);
    markOnboarded();
    router.replace("/");
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-5 pt-8 pb-2 safe-top flex items-center justify-between">
        <LogoMark size={28} />
        <span className="label">{step + 1} / 5</span>
      </header>

      <div className="px-5 pt-1">
        <div className="h-[3px] w-full bg-[var(--border)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[var(--accent)]"
            animate={{ width: `${((step + 1) / 5) * 100}%` }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
          />
        </div>
      </div>

      <div className="flex-1 px-5 pt-8 pb-32 max-w-md w-full mx-auto">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          {step === 0 && <StepWelcome />}
          {step === 1 && (
            <StepProfile draft={draft} setDraft={setDraft} />
          )}
          {step === 2 && (
            <StepBody draft={draft} setDraft={setDraft} />
          )}
          {step === 3 && (
            <StepActivity draft={draft} setDraft={setDraft} />
          )}
          {step === 4 && (
            <StepTargets
              goalsPreview={goalsPreview}
              setGoalsPreview={setGoalsPreview}
              computeGoals={computeGoals}
            />
          )}
        </motion.div>
      </div>

      <footer
        className="fixed bottom-0 inset-x-0 px-5 pb-6 pt-3 bar-top flex items-center justify-between gap-3 safe-bottom"
      >
        <button
          type="button"
          onClick={back}
          className={"btn btn-ghost " + (step === 0 ? "invisible" : "")}
        >
          Back
        </button>
        {step < 4 ? (
          <button
            type="button"
            onClick={() => {
              if (step === 3) computeGoals();
              next();
            }}
            className="btn btn-primary btn-lg flex-1 max-w-[260px]"
          >
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => goalsPreview && finish(goalsPreview)}
            className="btn btn-primary btn-lg flex-1 max-w-[260px]"
            disabled={!goalsPreview}
          >
            <Check size={16} /> Start tracking
          </button>
        )}
      </footer>
    </div>
  );
}

function makeProfile(d: Draft): Profile {
  const heightCm = d.units === "metric" ? d.heightCm : feetInchesToCm(d.heightFt, d.heightIn);
  const weightKg = d.units === "metric" ? d.weightKg : lbsToKg(d.weightLb);
  const now = Date.now();
  return {
    units: d.units,
    sex: d.sex,
    birthDate: d.birthDate,
    heightCm: Math.round(heightCm * 10) / 10,
    weightKg: Math.round(weightKg * 10) / 10,
    activityLevel: d.activityLevel,
    goal: d.goal,
    createdAt: now,
    updatedAt: now,
  };
}

function StepWelcome() {
  return (
    <div>
      <h1 className="display-xl">Track what you eat — without the noise.</h1>
      <p className="mt-5 text-[17px] leading-snug text-[var(--fg-dim)] max-w-[34ch]">
        FUEL is a clean, fast nutrition log. Calories, macros, and the micronutrient
        gaps everyone else hides.
      </p>
      <div className="mt-7 grid gap-3">
        <Bullet>Search USDA + Open Food Facts</Bullet>
        <Bullet>Scan barcodes for packaged foods</Bullet>
        <Bullet>Custom foods with the full nutrient panel</Bullet>
        <Bullet>Stays on your device. No account.</Bullet>
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-2 inline-block w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
      <span className="text-[15px] text-[var(--fg)]">{children}</span>
    </div>
  );
}

function StepProfile({
  draft,
  setDraft,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
}) {
  return (
    <div>
      <h2 className="display-lg">A bit about you.</h2>
      <p className="mt-2 text-[15px] text-[var(--fg-dim)]">
        We use this to estimate your daily calorie target. You can edit anything
        later.
      </p>

      <div className="mt-6 grid gap-5">
        <Field label="Sex">
          <Segmented
            value={draft.sex}
            options={[
              { value: "m", label: "Male" },
              { value: "f", label: "Female" },
              { value: "other", label: "Other" },
            ]}
            onChange={(v) => setDraft({ ...draft, sex: v as Sex })}
          />
        </Field>

        <Field label="Date of birth">
          <input
            type="date"
            value={draft.birthDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDraft({ ...draft, birthDate: e.target.value })}
          />
        </Field>

        <Field label="Units">
          <Segmented
            value={draft.units}
            options={[
              { value: "imperial", label: "lb / ft" },
              { value: "metric", label: "kg / cm" },
            ]}
            onChange={(v) => setDraft({ ...draft, units: v as Units })}
          />
        </Field>
      </div>
    </div>
  );
}

function StepBody({
  draft,
  setDraft,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
}) {
  const isImperial = draft.units === "imperial";

  return (
    <div>
      <h2 className="display-lg">Your body.</h2>
      <p className="mt-2 text-[15px] text-[var(--fg-dim)]">
        Used for BMR + macro defaults via Mifflin-St Jeor.
      </p>

      <div className="mt-6 grid gap-5">
        <Field label={isImperial ? "Height" : "Height"}>
          {isImperial ? (
            <div className="grid grid-cols-2 gap-2">
              <NumberInput
                value={draft.heightFt}
                onChange={(v) =>
                  setDraft({ ...draft, heightFt: v, heightCm: feetInchesToCm(v, draft.heightIn) })
                }
                suffix="ft"
                min={3}
                max={8}
                step={1}
              />
              <NumberInput
                value={draft.heightIn}
                onChange={(v) =>
                  setDraft({ ...draft, heightIn: v, heightCm: feetInchesToCm(draft.heightFt, v) })
                }
                suffix="in"
                min={0}
                max={11}
                step={1}
              />
            </div>
          ) : (
            <NumberInput
              value={Math.round(draft.heightCm)}
              onChange={(v) => {
                const fi = cmToFeetInches(v);
                setDraft({ ...draft, heightCm: v, heightFt: fi.ft, heightIn: fi.inches });
              }}
              suffix="cm"
              min={120}
              max={230}
              step={1}
            />
          )}
        </Field>

        <Field label="Weight">
          {isImperial ? (
            <NumberInput
              value={draft.weightLb}
              onChange={(v) => setDraft({ ...draft, weightLb: v, weightKg: lbsToKg(v) })}
              suffix="lb"
              min={70}
              max={500}
              step={0.5}
            />
          ) : (
            <NumberInput
              value={Math.round(draft.weightKg * 10) / 10}
              onChange={(v) => setDraft({ ...draft, weightKg: v, weightLb: kgToLbs(v) })}
              suffix="kg"
              min={32}
              max={230}
              step={0.1}
            />
          )}
        </Field>
      </div>
    </div>
  );
}

function StepActivity({
  draft,
  setDraft,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
}) {
  return (
    <div>
      <h2 className="display-lg">Your routine.</h2>
      <p className="mt-2 text-[15px] text-[var(--fg-dim)]">
        Pick the closest match to your week.
      </p>

      <div className="mt-6 grid gap-2">
        {[
          {
            value: "sedentary",
            title: "Sedentary",
            desc: "Desk job, little or no exercise",
          },
          {
            value: "light",
            title: "Light",
            desc: "Light exercise 1–3 days/week",
          },
          {
            value: "moderate",
            title: "Moderate",
            desc: "Moderate exercise 3–5 days/week",
          },
          {
            value: "very",
            title: "Very active",
            desc: "Hard exercise 6–7 days/week",
          },
          {
            value: "extreme",
            title: "Extreme",
            desc: "Heavy training 2× a day, physical job",
          },
        ].map((opt) => (
          <RadioCard
            key={opt.value}
            selected={draft.activityLevel === opt.value}
            onClick={() => setDraft({ ...draft, activityLevel: opt.value as ActivityLevel })}
          >
            <div>
              <div className="font-semibold text-[15px]">{opt.title}</div>
              <div className="text-[13px] text-[var(--fg-dim)]">{opt.desc}</div>
            </div>
          </RadioCard>
        ))}
      </div>

      <div className="mt-7">
        <div className="label mb-2">Goal</div>
        <Segmented
          value={draft.goal}
          options={[
            { value: "cut", label: "Cut" },
            { value: "maintain", label: "Maintain" },
            { value: "bulk", label: "Bulk" },
          ]}
          onChange={(v) => setDraft({ ...draft, goal: v as Goal })}
        />
        <p className="mt-2 text-[12px] text-[var(--muted)]">
          Cut applies a 500 kcal deficit, bulk a 300 kcal surplus.
        </p>
      </div>
    </div>
  );
}

function StepTargets({
  goalsPreview,
  setGoalsPreview,
  computeGoals,
}: {
  goalsPreview: Goals | null;
  setGoalsPreview: (g: Goals) => void;
  computeGoals: () => void;
}) {
  if (!goalsPreview) {
    if (typeof window !== "undefined") {
      // ensure goals computed when this step renders
      queueMicrotask(computeGoals);
    }
    return null;
  }

  const update = (patch: Partial<Goals>) =>
    setGoalsPreview({ ...goalsPreview, ...patch });

  return (
    <div>
      <h2 className="display-lg">Your targets.</h2>
      <p className="mt-2 text-[15px] text-[var(--fg-dim)]">
        Auto-tuned from your profile. Tap any value to adjust.
      </p>

      <div className="mt-6 card p-5">
        <div className="flex items-baseline gap-2">
          <div className="numeric text-[44px] font-semibold leading-none">
            {goalsPreview.calories.toLocaleString()}
          </div>
          <div className="label">kcal / day</div>
        </div>
        <input
          type="range"
          min={1000}
          max={5000}
          step={50}
          value={goalsPreview.calories}
          onChange={(e) => update({ calories: Number(e.target.value) })}
          className="w-full mt-3 accent-[var(--accent)]"
        />
        <div className="grid grid-cols-3 gap-3 mt-5">
          <MacroEdit
            label="Protein"
            color="var(--accent)"
            value={goalsPreview.protein_g}
            onChange={(v) => update({ protein_g: v })}
          />
          <MacroEdit
            label="Carbs"
            color="var(--info)"
            value={goalsPreview.carbs_g}
            onChange={(v) => update({ carbs_g: v })}
          />
          <MacroEdit
            label="Fat"
            color="var(--accent-soft)"
            value={goalsPreview.fat_g}
            onChange={(v) => update({ fat_g: v })}
          />
        </div>
      </div>
    </div>
  );
}

function MacroEdit({
  label,
  color,
  value,
  onChange,
}: {
  label: string;
  color: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="label">{label}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="numeric"
          style={{ width: "100%" }}
          min={0}
          max={600}
        />
      </div>
      <div className="label mt-1">g</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="label mb-2">{label}</div>
      {children}
    </label>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="grid grid-cols-3 p-1 bg-[var(--panel-2)] rounded-[var(--radius)] border border-[var(--border)] gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={
            "h-10 rounded-[6px] text-[13px] font-semibold transition-colors " +
            (value === o.value
              ? "bg-[var(--panel)] shadow-[var(--shadow-sm)] text-[var(--fg)]"
              : "text-[var(--fg-dim)]")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  suffix,
  ...rest
}: {
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        {...rest}
      />
      {suffix ? (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 label pointer-events-none">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

function RadioCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "card text-left px-4 py-3 transition-all flex items-center justify-between gap-3 " +
        (selected ? "!border-[var(--accent)] bg-[var(--panel)]" : "")
      }
    >
      {children}
      <span
        className={
          "inline-flex items-center justify-center w-5 h-5 rounded-full border " +
          (selected
            ? "border-[var(--accent)] bg-[var(--accent)]"
            : "border-[var(--border-strong)]")
        }
      >
        {selected ? <Check size={12} strokeWidth={3} className="text-white" /> : null}
      </span>
    </button>
  );
}
