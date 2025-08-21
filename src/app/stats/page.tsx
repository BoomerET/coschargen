// app/stats/page.tsx
"use client";

import { useCharacterStore, type StatKey } from "@/lib/store/character";

const ATTRS: { key: StatKey; label: string }[] = [
  { key: "STR", label: "Strength (STR)" },
  { key: "SPD", label: "Speed (SPD)" },
  { key: "INT", label: "Intellect (INT)" },
  { key: "WIL", label: "Willpower (WIL)" },
  { key: "AWA", label: "Awareness (AWA)" },
  { key: "PRE", label: "Presence (PRE)" },
];

export default function StatsPage() {
  const { stats, totalStatPoints, adjustStat, setStat, resetStats } = useCharacterStore();

  const used = Object.values(stats).reduce((s, v) => s + v, 0);
  const remaining = totalStatPoints - used;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold">Stats</h1>
      <p className="mb-6 text-sm text-gray-600">
        Distribute {totalStatPoints} points among six attributes. Each attribute ranges from 0–3.
      </p>

      {/* Remaining points */}
      <div
        className={[
          "mb-4 inline-flex items-center rounded-full border px-3 py-1 text-sm",
          remaining === 0 ? "bg-gray-900 text-white border-gray-900" : "bg-gray-50",
        ].join(" ")}
        aria-live="polite"
      >
        Remaining points: <span className="ml-1 font-semibold">{remaining}</span>
      </div>

      {/* Grid of attributes */}
      <div className="grid gap-4 sm:grid-cols-2">
        {ATTRS.map(({ key, label }) => {
          const value = stats[key];
          const canDec = value > 0;
          const canInc = value < 3 && remaining > 0;

          return (
            <div key={key} className="rounded-xl border p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">{label}</div>
                </div>
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
                    // setStat enforces 0–3 and the overall 12-point cap
                    setStat(key, isNaN(raw) ? 0 : raw);
                  }}
                  className="w-16 rounded-lg border px-2 py-1 text-center"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={resetStats}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Reset all to 0
        </button>
        <span className="text-xs text-gray-500">Values save automatically.</span>
      </div>
    </div>
  );
}

