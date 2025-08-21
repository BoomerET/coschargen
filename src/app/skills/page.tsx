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

export default function SkillsPage() {
  const { path, stats, skillRanks, setSkillRank, resetSkills } = useCharacterStore();

  const pathGranted: SkillKey | null = useMemo(
    () => (path ? PATH_GRANTED_SKILL[path] : null),
    [path]
  );

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 text-2xl font-bold">Skills</h1>
      <p className="mb-6 text-sm text-gray-600">
        Assign base ranks (0–5). Your Path grants a <strong>minimum of 1 rank</strong> in{" "}
        {pathGranted ? <em>{pathGranted}</em> : "its associated skill"}. Skill checks use:{" "}
        <strong>Check Value = Effective Rank + Governing Attribute</strong>.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SKILLS.map((k) => {
          const base = skillRanks[k] ?? 0;
          const isPathSkill = pathGranted === k;
          const effective = Math.min(5, Math.max(base, isPathSkill ? 1 : 0));

          const attrKey = SKILL_ATTR[k];           // e.g., "INT"
          const attrVal = stats[attrKey] ?? 0;     // 0–3 from your Stats page
          const checkValue = effective + attrVal;  // final check value

          return (
            <div key={k} className="rounded-xl border p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-medium text-gray-800">{k}</div>
              </div>

              <input
                id={`skill-${k}`}
                type="number"
                inputMode="numeric"
                min={0}
                max={5}
                step={1}
                value={base}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setSkillRank(k, isNaN(n) ? 0 : n);
                }}
                onBlur={(e) => {
                  if (e.currentTarget.value === "") setSkillRank(k, 0);
                }}
                className="w-24 rounded-lg border px-2 py-1 text-center"
              />

              <div className="mt-3 grid grid-cols-3 items-end gap-2">
                {/* Effective Rank */}
                <div>
                  <div className="text-xs text-gray-500">Rank</div>
                  <div className="mt-1 rounded-full bg-gray-900 px-3 py-1 text-center text-sm font-semibold text-white">
                    {effective}
                  </div>
                </div>

                {/* Attribute value */}
                <div>
                  <div className="text-xs text-gray-500">{attrKey}</div>
                  <div className="mt-1 rounded-full border px-3 py-1 text-center text-sm font-semibold">
                    {attrVal}
                  </div>
                </div>

                {/* Check Value (sum) */}
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

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={resetSkills}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Reset all to 0
        </button>
        <span className="text-xs text-gray-500">
          Effective rank includes your Path’s minimum (if applicable). Check Value updates automatically.
        </span>
      </div>
    </div>
  );
}

