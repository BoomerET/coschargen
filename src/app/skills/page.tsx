// src/app/skills/page.tsx
"use client";

import { useMemo } from "react";
import {
  useCharacterStore,
  type SkillKey,
  SKILL_ATTR,
  PATH_GRANTED_SKILL,
  getPathGrantedSkill,
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

// Points spent using creation cost semantics
const pointsSpent = useMemo(() => {
  return (Object.entries(skillRanks) as [SkillKey, number][])
    .reduce((sum, [k, base]) => {
      const cost = pathGranted === k ? Math.max(0, base - 1) : base;
      return sum + cost;
    }, 0);
}, [skillRanks, pathGranted]);
const pointsRemaining = Math.max(0, skillPointsTotal - pointsSpent);
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 text-2xl font-bold">Skills</h1>

      <div
        className={[
          "mb-6 inline-flex items-center rounded-full border px-3 py-1 text-sm",
          pointsRemaining === 0 ? "bg-gray-900 text-white border-gray-900" : "bg-gray-50",
        ].join(" ")}
        aria-live="polite"
      >
        Points remaining: <span className="ml-1 font-semibold">{pointsRemaining}</span>
      </div>&nbsp;
      <button
          type="button"
          onClick={resetSkills}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Reset Ranks to 0
        </button>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SKILLS.map((k) => {
          const base = skillRanks[k] ?? 0;                 // stored 0..2
          const isPathSkill = pathGranted === k;
          const effective = Math.min(5, Math.max(base, isPathSkill ? 1 : 0)); // shown rank

          const attrKey = SKILL_ATTR[k]; // e.g., "INT"
          const attrVal = stats[attrKey] ?? 0;
          const checkValue = effective + attrVal;

          // ----- INPUT MAPPING -----


// For the Path skill, input shows EFFECTIVE rank (1..2) and maps back to base:
//  - 1 => base 0 (free)
//  - 2 => base 2 (cost = 1)
let inputMin = 0;
let inputMax = Math.min(2, base + pointsRemaining);
let inputValue = base;

// Compute whether we can raise Path skill to 2 given remaining points
if (isPathSkill) {
  inputMin = 1;
  // current cost for Path skill is 0 if base < 2 else 1
  const currentCost = base >= 2 ? 1 : 0;
  const canReachTwo = pointsRemaining >= (1 - currentCost);
  inputMax = canReachTwo ? 2 : 1;
  inputValue = Math.max(base, 1); // show 1 when base=0 due to the free floor
}

const onChange = (raw: number) => {
  if (!isPathSkill) {
    setSkillRank(k, raw); // store clamps to budget and 0..2
  } else {
    const desired = Math.max(inputMin, Math.min(inputMax, Math.floor(raw))); // 1 or 2
    const mappedBase = desired === 1 ? 0 : 2; // free floor vs. paid upgrade
    setSkillRank(k, mappedBase);
  }
};


          return (
            <div key={k} className="rounded-xl border p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-medium text-gray-800">{k}</div>
              </div>

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

              <div className="mt-3 grid grid-cols-3 items-end gap-2">
                <div>
                  <div className="text-xs text-gray-500">Rank</div>
                  <div className="mt-1 rounded-full bg-gray-900 px-3 py-1 text-center text-sm font-semibold text-white">
                    {effective}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">{attrKey}</div>
                  <div className="mt-1 rounded-full border px-3 py-1 text-center text-sm font-semibold">
                    {attrVal}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Final</div>
                  <div className="mt-1 rounded-full border px-3 py-1 text-center text-sm font-semibold">
                    {checkValue}
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

