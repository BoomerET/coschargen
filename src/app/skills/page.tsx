// src/app/skills/page.tsx
"use client";

import { useMemo } from "react";
import {
  useCharacterStore,
  type SkillKey,
  SKILL_ATTR,
  PATH_GRANTED_SKILL,
  type Path,
} from "@/lib/store/character";

const SKILLS: SkillKey[] = [
  "Agility","Athletics","Crafting","Deception","Deduction","Discipline",
  "Heavy Weaponry","Insight","Intimidation","Leadership","Light Weaponry",
  "Lore","Medicine","Perception","Persuasion","Stealth","Survival","Thievery",
];

// Recommended skills by Path
const RECOMMENDED: Record<Exclude<Path, "">, readonly SkillKey[]> = {
//  Agent: ["Agility","Deception","Deduction","Insight","Light Weaponry","Thievery"],
//  Envoy: ["Deception","Leadership","Lore","Persuasion"],
//  Hunter: ["Agility","Perception","Stealth","Survival","Light Weaponry","Heavy Weaponry"], // “either” => show both
//  Leader: ["Athletics","Deception","Heavy Weaponry","Intimidation","Leadership","Persuasion"],
//  Scholar: ["Crafting","Deduction","Lore","Medicine"],
//  Warrior: ["Athletics","Light Weaponry","Heavy Weaponry","Intimidation","Leadership","Persuasion"],
  Agent: ["Agility","Deception","Deduction","Light Weaponry","Thievery"],
  Envoy: ["Deception","Leadership","Lore","Persuasion"],
  Hunter: ["Agility","Stealth","Survival","Light Weaponry","Heavy Weaponry"], // “either” => show both
  Leader: ["Athletics","Deception","Heavy Weaponry","Intimidation","Persuasion"],
  Scholar: ["Crafting","Deduction","Medicine"],
  Warrior: ["Light Weaponry","Heavy Weaponry","Intimidation","Leadership","Persuasion"],
} as const;

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

  const recommendedSet = useMemo(() => {
    if (!path) return new Set<SkillKey>();
    const list = RECOMMENDED[path as Exclude<Path, "">] ?? [];
    return new Set(list);
  }, [path]);

  // Points spent using creation cost semantics
  const pointsSpent = useMemo(() => {
    return (Object.entries(skillRanks) as [SkillKey, number][]).reduce(
      (sum, [k, base]) => {
        const cost = pathGranted === k ? Math.max(0, base - 1) : base;
        return sum + cost;
      },
      0
    );
  }, [skillRanks, pathGranted]);

  const pointsRemaining = Math.max(0, skillPointsTotal - pointsSpent);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 text-2xl font-bold">Skills</h1>

      <div
        className={[
          "mb-6 inline-flex items-center rounded-full border px-3 py-1 text-sm",
          pointsRemaining === 0
            ? "bg-gray-900 text-white border-gray-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
            : "bg-gray-50 text-gray-800 border-gray-200 dark:bg-slate-800 dark:text-gray-100 dark:border-gray-700",
        ].join(" ")}
        aria-live="polite"
      >
        Points remaining:
        <span className="ml-1 font-semibold">{pointsRemaining}</span>
      </div>
      &nbsp;
      <button
        type="button"
        onClick={resetSkills}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-slate-800"
      >
        Reset Ranks to 0
      </button>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SKILLS.map((k) => {
          const base = skillRanks[k] ?? 0; // stored 0..2
          const isPathSkill = pathGranted === k;
          const isRecommended = recommendedSet.has(k);
          const effective = Math.min(5, Math.max(base, isPathSkill ? 1 : 0)); // shown rank

          const attrKey = SKILL_ATTR[k];
          const attrVal = stats[attrKey] ?? 0;
          const checkValue = effective + attrVal;

          // ----- INPUT MAPPING -----
          let inputMin = 0;
          let inputMax = Math.min(2, base + pointsRemaining);
          let inputValue = base;

          if (isPathSkill) {
            inputMin = 1;
            const currentCost = base >= 2 ? 1 : 0;
            const canReachTwo = pointsRemaining >= 1 - currentCost;
            inputMax = canReachTwo ? 2 : 1;
            inputValue = Math.max(base, 1); // show 1 when base=0 due to the free floor
          }

          const onChange = (raw: number) => {
            if (!isPathSkill) {
              setSkillRank(k, raw); // store clamps to budget and 0..2
            } else {
              const desired = Math.max(
                inputMin,
                Math.min(inputMax, Math.floor(raw))
              ); // 1 or 2
              const mappedBase = desired === 1 ? 0 : 2; // free floor vs. paid upgrade
              setSkillRank(k, mappedBase);
            }
          };

          // Visual styling:
          // - Path free skill: indigo border + ring
          // - Recommended (not path): amber border + ring
          // - If both: keep indigo border, add a small amber "Recommended" pill
          const cardClass = [
            "rounded-xl border p-4 bg-white/80 dark:bg-slate-900/60",
            isPathSkill
              ? "border-indigo-500 ring-1 ring-indigo-400/40 dark:border-indigo-400 dark:ring-indigo-300/40"
              : isRecommended
                ? "border-amber-500 ring-1 ring-amber-400/40 dark:border-amber-400 dark:ring-amber-300/40"
                : "border-gray-200 dark:border-gray-700",
          ].join(" ");

          return (
            <div
              key={k}
              className={cardClass}
              aria-label={
                isPathSkill
                  ? "Path free-rank skill"
                  : isRecommended
                  ? "Recommended skill for your Path"
                  : undefined
              }
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {k}
                </div>
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
                  if (e.currentTarget.value === "") onChange(isPathSkill ? 1 : 0);
                }}
                onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                className="w-24 rounded-lg border border-gray-300 bg-white px-2 py-1 text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400/30 dark:border-gray-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-slate-600/40"
                aria-describedby={`hint-${k}`}
              />

              <div className="mt-3 grid grid-cols-3 items-end gap-2">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Rank</div>
                  <div className="mt-1 rounded-full bg-gray-900 px-3 py-1 text-center text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                    {effective}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{attrKey}</div>
                  <div className="mt-1 rounded-full border border-gray-300 px-3 py-1 text-center text-sm font-semibold text-gray-900 dark:border-gray-700 dark:text-slate-100">
                    {attrVal}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Final</div>
                  <div className="mt-1 rounded-full border border-gray-300 px-3 py-1 text-center text-sm font-semibold text-gray-900 dark:border-gray-700 dark:text-slate-100">
                    {checkValue}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
        Legend: <span className="font-semibold text-indigo-600 dark:text-indigo-300">Indigo</span> = free Path skill,&nbsp;
        <span className="font-semibold text-amber-600 dark:text-amber-300">Amber</span> = recommended for your Path.
      </p>
    </div>
  );
}

