// src/app/skills/page.tsx
"use client";

import { useMemo } from "react";
import {
  useCharacterStore,
  type SkillKey,
  SKILL_ATTR,
  PATH_GRANTED_SKILL,
} from "@/lib/store/character";

const SKILLS: SkillKey[] = [
  "Agility","Athletics","Crafting","Deception","Deduction","Discipline",
  "Heavy Weaponry","Insight","Intimidation","Leadership","Light Weaponry",
  "Lore","Medicine","Perception","Persuasion","Stealth","Survival","Thievery",
];

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export default function SkillsPage() {
  const {
    path,
    stats,
    skillRanks,
    setSkillRank,
    resetSkills,
    skillPointsTotal,
  } = useCharacterStore();

  const pathGranted: SkillKey | null = useMemo(
    () => (path ? PATH_GRANTED_SKILL[path] : null),
    [path]
  );

  const pointsSpent = useMemo(
    () => Object.values(skillRanks).reduce((s, v) => s + v, 0),
    [skillRanks]
  );
  const pointsRemaining = Math.max(0, skillPointsTotal - pointsSpent);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 text-2xl font-bold">Skills</h1>
      <p className="mb-4 text-sm text-gray-600">
        You have <strong>{skillPointsTotal}</strong> points to raise skill ranks (max{" "}
        <strong>2 per skill</strong>). Your Path grants a{" "}
        <strong>minimum rank of 1</strong> in{" "}
        {pathGranted ? <em>{pathGranted}</em> : "its associated skill"}.
        Skill check = <strong>Effective Rank + Governing Attribute</strong>.
      </p>

      <div
        className={[
          "mb-6 inline-flex items-center rounded-full border px-3 py-1 text-sm",
          pointsRemaining === 0 ? "bg-gray-900 text-white border-gray-900" : "bg-gray-50",
        ].join(" ")}
        aria-live="polite"
      >
        Points remaining: <span className="ml-1 font-semibold">{pointsRemaining}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SKILLS.map((k) => {
          const base = skillRanks[k] ?? 0;                 // stored 0..2
          const isPathSkill = pathGranted === k;
          const effective = Math.min(5, Math.max(base, isPathSkill ? 1 : 0)); // shown rank

          const attrKey = SKILL_ATTR[k]; // e.g., "INT"
          const attrVal = stats[attrKey] ?? 0;
          const checkValue = effective + attrVal;

          // ----- INPUT MAPPING -----
          // For non-Path skills: input shows/stores base directly (0..2, budget-limited).
          // For Path skill: input shows EFFECTIVE rank (1..2). We map back to base:
          //   desired 1 -> base 0  (no points)
          //   desired 2 -> base 2  (costs up to 2 points; 1 if base was 1)
          let inputMin = 0;
          let inputMax = Math.min(2, base + pointsRemaining); // non-Path default
          let inputValue = base; // non-Path default
          if (isPathSkill) {
            inputMin = 1; // floor from Path
            // Can we reach 2 given current base + remaining?
            const additionalNeededForTwo = Math.max(0, 2 - base);
            const canReachTwo = pointsRemaining >= additionalNeededForTwo;
            inputMax = canReachTwo ? 2 : 1;
            inputValue = effective; // show the floor (1) even when base=0
          }

          const onChange = (raw: number) => {
            if (!isPathSkill) {
              // Store clamps to 0..2 and budget anyway
              setSkillRank(k, raw);
            } else {
              const desired = clamp(raw, inputMin, inputMax); // 1 or 2
              // Normalize to a non-wasteful base:
              // 1 => base 0 (free floor), 2 => base 2
              const mappedBase = desired === 1 ? 0 : 2;
              setSkillRank(k, mappedBase);
            }
          };

          return (
            <div key={k} className="rounded-xl border p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-medium text-gray-800">{k}</div>
                <span className="rounded-md border bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                  {attrKey}
                </span>
              </div>

              <label htmlFor={`skill-${k}`} className="mb-1 block text-xs text-gray-600">
                {isPathSkill ? "Rank (Path minimum applies)" : "Base Rank (0–2 during creation)"}
              </label>
              <input
                id={`skill-${k}`}
                type="number"
                inputMode="numeric"
                min={inputMin}
                max={inputMax}
                step={1}
                value={inputValue}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isNaN(n)) return;
                  onChange(n);
                }}
                onBlur={(e) => {
                  // Empty -> keep current; wheel guard
                  if (e.currentTarget.value === "") onChange(isPathSkill ? 1 : 0);
                }}
                onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                className="w-24 rounded-lg border px-2 py-1 text-center"
                aria-describedby={`hint-${k}`}
              />

              <p id={`hint-${k}`} className="mt-1 text-xs text-gray-500">
                {isPathSkill
                  ? `Allowed now: ${inputMin}–${inputMax} (1 is your free Path rank; increase to 2 to improve).`
                  : `Allowed now: 0–${inputMax}.`}
              </p>

              <div className="mt-3 grid grid-cols-3 items-end gap-2">
                <div>
                  <div className="text-xs text-gray-500">Effective Rank</div>
                  <div className="mt-1 rounded-full bg-gray-900 px-3 py-1 text-center text-sm font-semibold text-white">
                    {effective}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">{attrKey} (Attr)</div>
                  <div className="mt-1 rounded-full border px-3 py-1 text-center text-sm font-semibold">
                    {attrVal}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Check Value</div>
                  <div className="mt-1 rounded-full border px-3 py-1 text-center text-sm font-semibold">
                    {checkValue}
                  </div>
                </div>
              </div>

              {isPathSkill && (
                <p className="mt-2 text-xs text-gray-500">
                  Your Path grants a free rank of 1. Spending 1 point here has no effect;
                  set it to 2 to improve the skill.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={resetSkills}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Reset all to 0
        </button>
        <span className="text-xs text-gray-500">
          Budget and per-skill caps are enforced automatically.
        </span>
      </div>
    </div>
  );
}

