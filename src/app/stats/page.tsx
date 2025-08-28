// src/app/stats/page.tsx
"use client";

import { useMemo } from "react";
import { useCharacterStore, type StatKey, type Path } from "@/lib/store/character";
import { Eye, Shield, Brain, Sparkles } from "lucide-react";
import DieIcon from "@/app/components/DieIcon";

const ATTRS: { key: StatKey; label: string }[] = [
  { key: "STR", label: "Strength (STR)" },
  { key: "SPD", label: "Speed (SPD)" },
  { key: "INT", label: "Intellect (INT)" },
  { key: "WIL", label: "Willpower (WIL)" },
  { key: "AWA", label: "Awareness (AWA)" },
  { key: "PRE", label: "Presence (PRE)" },
];

// Which attributes to highlight for each Path
const HIGHLIGHTS: Record<Exclude<Path, "">, readonly StatKey[]> = {
  Agent: ["AWA", "INT", "SPD"],
  Envoy: ["PRE", "WIL"],
  Hunter: ["AWA", "STR", "SPD"],
  Leader: ["PRE", "STR", "WIL"],
  Scholar: ["INT", "PRE"],
  Warrior: ["SPD", "STR"],
} as const;

function calcLiftingCapacity(str: number): number {
  const s = Math.max(0, Math.floor(str));
  if (s === 0) return 100;
  if (s <= 2) return 200;
  if (s <= 4) return 500;
  if (s <= 6) return 1_000;
  if (s <= 8) return 5_000;
  return 10_000;
}
function calcCarryingCapacity(str: number): number {
  const s = Math.max(0, Math.floor(str));
  if (s === 0) return 50;
  if (s <= 2) return 100;
  if (s <= 4) return 250;
  if (s <= 6) return 500;
  if (s <= 8) return 2_500;
  return 5_000;
}
function calcMovementRate(spd: number): number {
  const s = Math.max(0, Math.floor(spd));
  if (s === 0) return 20;
  if (s <= 2) return 25;
  if (s <= 4) return 30;
  if (s <= 6) return 40;
  if (s <= 8) return 60;
  return 80;
}
function calcRecoveryDie(wil: number): "1d4" | "1d6" | "1d8" | "1d10" | "1d12" | "1d0" {
  const w = Math.max(0, Math.floor(wil));
  if (w === 0) return "1d4";
  if (w <= 2) return "1d6";
  if (w <= 4) return "1d8";
  if (w <= 6) return "1d10";
  if (w <= 8) return "1d12";
  return "1d0";
}
function calcSensesRange(awa: number): string {
  const a = Math.max(0, Math.floor(awa));
  if (a === 0) return "5 ft";
  if (a <= 2) return "10 ft";
  if (a <= 4) return "20 ft";
  if (a <= 6) return "50 ft";
  if (a <= 8) return "100 ft";
  return "Unaffected by obscured senses";
}

export default function StatsPage() {
  const { stats, totalStatPoints, setStat, resetStats, path } = useCharacterStore();

  const used = Object.values(stats).reduce((s, v) => s + v, 0);
  const remaining = totalStatPoints - used;

  const {
    str = 0,
    spd = 0,
    int = 0,
    wil = 0,
    awa = 0,
    pre = 0,
  } = {
    str: stats?.STR ?? 0,
    spd: stats?.SPD ?? 0,
    int: stats?.INT ?? 0,
    wil: stats?.WIL ?? 0,
    awa: stats?.AWA ?? 0,
    pre: stats?.PRE ?? 0,
  };

  //const movementFt = useMemo(() => calcMovementRate(spd), [spd]);
  const recoveryDie = useMemo(() => calcRecoveryDie(wil), [wil]);
  //const dieSides = parseInt((recoveryDie || "").replace(/^\d*d/, ""), 10) || 0;
  //const sensesRange = useMemo(() => calcSensesRange(awa), [awa]);

  const { lifting, carrying } = useMemo(
    () => ({ lifting: calcLiftingCapacity(str), carrying: calcCarryingCapacity(str) }),
    [str]
  );

  const defenses = useMemo(
    () => ({
      physical: 10 + str + spd,
      cognitive: 10 + int + wil,
      spiritual: 10 + awa + pre,
    }),
    [str, spd, int, wil, awa, pre]
  );

  const highlightedKeys = (path ? HIGHLIGHTS[path as Exclude<Path, "">] : []) as readonly StatKey[];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold">Stats</h1>

      {/* Remaining points */}
      <div
        className={[
          "mb-4 inline-flex items-center rounded-full border px-3 py-1 text-sm",
          "border-gray-200 dark:border-gray-700",
          remaining === 0
            ? "bg-gray-900 text-white dark:bg-slate-100 dark:text-slate-900"
            : "bg-gray-50 text-gray-800 dark:bg-slate-800 dark:text-gray-100",
        ].join(" ")}
        aria-live="polite"
      >
        Remaining points:
        <span className="ml-1 font-semibold">{remaining}</span>
      </div>

      <button
        type="button"
        onClick={resetStats}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-slate-800"
      >
        Reset all to 0
      </button>

      {/* Grid of attributes */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {ATTRS.map(({ key, label }) => {
          const value = stats[key];
          const isHighlighted = highlightedKeys.includes(key);

          const cardClass = [
            "rounded-xl border p-4 bg-white/80 dark:bg-slate-900/60",
            isHighlighted
              ? "border-amber-500 ring-1 ring-amber-400/40 dark:border-amber-400 dark:ring-amber-300/40"
              : "border-gray-200 dark:border-gray-700",
          ].join(" ");

          return (
            <div key={key} className={cardClass}>
              <div className="mb-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={3}
                  value={value}
                  aria-label={`${label} value`}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    setStat(key, Number.isNaN(raw) ? 0 : raw);
                  }}
                  className="w-16 rounded-lg border border-gray-300 bg-white px-2 py-1 text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400/30 dark:border-gray-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-slate-600/40"
                />
              </div>
            </div>
          );
        })}
      </div>

      <section className="mt-8">
        <p className="text-gray-800 dark:text-gray-200">
          <b>Derived Stats</b>
        </p>
        <hr className="border-gray-200 dark:border-gray-700" />
        <br />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-gray-700 dark:bg-slate-900/60">
            <div className="text-sm text-gray-600 dark:text-gray-400">Lifting Capacity</div>
            <div className="mt-1 text-2xl font-semibold">{lifting.toLocaleString()} lbs</div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-gray-700 dark:bg-slate-900/60">
            <div className="text-sm text-gray-600 dark:text-gray-400">Carrying Capacity</div>
            <div className="mt-1 text-2xl font-semibold">{carrying.toLocaleString()} lbs</div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Movement Rate (SPD) */}
          <div className="rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-gray-700 dark:bg-slate-900/60">
            <div className="text-sm text-gray-600 dark:text-gray-400">Movement Rate</div>
            <div className="mt-1 text-2xl font-semibold">{calcMovementRate(spd)}ft/action</div>
          </div>

          {/* Recovery Die (WIL) */}
          <div className="rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-gray-700 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">Recovery Die</div>
              <DieIcon sides={parseInt((recoveryDie || "").replace(/^\d*d/, ""), 10) || 0} className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="mt-1 inline-flex items-center gap-2">
              <span className="text-2xl font-semibold">{recoveryDie}</span>
            </div>
            {recoveryDie === "1d0" && (
              <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
                Note: a d0 always rolls 0. If this is intentional, you’re all set.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-gray-700 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">Senses Range</div>
            <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden />
          </div>
          <div className="mt-1 text-2xl font-semibold">{calcSensesRange(awa)}</div>
        </div>
      </section>

      <section className="mt-8">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Physical Defense */}
          <div className="rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-gray-700 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">Physical Defense</div>
              <Shield className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden />
            </div>
            <div className="mt-1 text-2xl font-semibold">{defenses.physical}</div>
          </div>

          {/* Cognitive Defense */}
          <div className="rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-gray-700 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">Cognitive Defense</div>
              <Brain className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden />
            </div>
            <div className="mt-1 text-2xl font-semibold">{defenses.cognitive}</div>
          </div>

          {/* Spiritual Defense */}
          <div className="rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-gray-700 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">Spiritual Defense</div>
              <Sparkles className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden />
            </div>
            <div className="mt-1 text-2xl font-semibold">{defenses.spiritual}</div>
          </div>
        </div>
      </section>
    </div>
  );
}

