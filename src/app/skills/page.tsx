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
  const { path, stats, skillRanks, setSkillRank, resetSkills, skillPointsTotal } =
    useCharacterStore();

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
        <strong>minimum rank of 1</strong> in {pathGranted ? <em>{pathGranted}</em> : "its skill"}.
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
          const base = skillRanks[k] ?? 0;
          const isPathSkill = pathGranted === k;
          const effective = Math.min(5, Math.max(base, isPathSkill ? 1 : 0));
          const attrKey = SKILL_ATTR[k];
          const attrVal = stats[attrKey] ?? 0;
          const checkValue = effective + attrVal;

          // dynamic max: you can always keep current; you can only add up to remaining
          const maxForField = Math.min(2, base + pointsRemaining);

          return (
            <div key={k} className="rounded-xl border p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-medium text-gray-800">{k}</div>
                <span className="rounded-md border bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                  {attrKey}
                </span>
              </div>

              <input
                id={`skill-${k}`}
                type="number"
                inputMode="numeric"
                min={0}
                max={maxForField}
                step={1}
                value={base}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setSkillRank(k, isNaN(n) ? 0 : n); // store enforces budget & cap
                }}
                onBlur={(e) => {
                  if (e.currentTarget.value === "") setSkillRank(k, 0);
                }}
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

              {isPathSkill && base === 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  Path bonus ensures a minimum effective rank of 1 (cannot exceed 2 during creation).
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

