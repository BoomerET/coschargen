"use client";

import { useMemo } from "react";
import { useCharacterStore } from "@/lib/store/character";
import { PATH_GRANTED_SKILL, SKILL_ATTR, type SkillKey } from "@/lib/store/character";
import { Button } from "react-aria-components"; // remove if you’re not using this; plain <button> works

// If you already have a central SKILLS list, import it instead:
const SKILLS: SkillKey[] = [
  "Agility","Athletics","Crafting","Deception","Deduction","Discipline",
  "Heavy Weaponry","Insight","Intimidation","Leadership","Light Weaponry",
  "Lore","Medicine","Perception","Persuasion","Stealth","Survival","Thievery",
];

// ------- small helpers for derived fields -------
function keyTalent(ancestry: string, path: string | ""): string | null {
  if (ancestry === "Singer") return "Change Form";
  if (ancestry === "Human (Roshar)") {
    if (!path) return null;
    return {
      Agent: "Opportunist",
      Envoy: "Rousing Presence",
      Hunter: "Seek Quarry",
      Leader: "Decisive Command",
      Scholar: "Erudition",
      Warrior: "Vigilant Stance",
    }[path as keyof typeof PATH_GRANTED_SKILL] as string;
  }
  return null;
}

function liftingCapacity(str: number): number {
  const s = Math.max(0, Math.floor(str));
  if (s === 0) return 100;
  if (s <= 2) return 200;
  if (s <= 4) return 500;
  if (s <= 6) return 1_000;
  if (s <= 8) return 5_000;
  return 10_000;
}
function carryingCapacity(str: number): number {
  const s = Math.max(0, Math.floor(str));
  if (s === 0) return 50;
  if (s <= 2) return 100;
  if (s <= 4) return 250;
  if (s <= 6) return 500;
  if (s <= 8) return 2_500;
  return 5_000;
}
function movementRate(spd: number): number {
  const s = Math.max(0, Math.floor(spd));
  if (s === 0) return 20;
  if (s <= 2) return 25;
  if (s <= 4) return 30;
  if (s <= 6) return 40;
  if (s <= 8) return 60;
  return 80;
}
function recoveryDie(wil: number): "1d4"|"1d6"|"1d8"|"1d10"|"1d12"|"1d0" {
  const w = Math.max(0, Math.floor(wil));
  if (w === 0) return "1d4";
  if (w <= 2) return "1d6";
  if (w <= 4) return "1d8";
  if (w <= 6) return "1d10";
  if (w <= 8) return "1d12";
  return "1d0";
}
function sensesRange(awa: number): string {
  const a = Math.max(0, Math.floor(awa));
  if (a === 0) return "5 ft";
  if (a <= 2) return "10 ft";
  if (a <= 4) return "20 ft";
  if (a <= 6) return "50 ft";
  if (a <= 8) return "100 ft";
  return "Unaffected by obscured senses";
}

export default function ExportPage() {
  // Grab the entire store state (values only)
  const state = useCharacterStore();
  const {
    name, ancestry, path, pathFocus, level,
    stats, totalStatPoints,
    culturalExpertises, generalExpertises,
    skillRanks, skillPointsTotal,
  } = state;

  // Build a plain “state only” snapshot (no setter functions)
  const storeSnapshot = useMemo(() => ({
    basics: { name, ancestry, path, pathFocus, level },
    stats: { ...stats, totalStatPoints },
    expertises: {
      cultural: culturalExpertises,
      additional: generalExpertises,
    },
    skills: {
      baseRanks: skillRanks,
      pointsTotal: skillPointsTotal,
      pointsSpent: Object.values(skillRanks).reduce((s, v) => s + v, 0),
    },
    timestamp: new Date().toISOString(),
  }), [
    name, ancestry, path, pathFocus, level,
    stats, totalStatPoints, culturalExpertises, generalExpertises,
    skillRanks, skillPointsTotal,
  ]);

  // Derived snapshot (effective skill ranks, key talent, common derived stats)
  const derivedSnapshot = useMemo(() => {
    const str = stats.STR ?? 0;
    const spd = stats.SPD ?? 0;
    const int = stats.INT ?? 0;
    const wil = stats.WIL ?? 0;
    const awa = stats.AWA ?? 0;
    const pre = stats.PRE ?? 0;

    const pathGranted = path ? PATH_GRANTED_SKILL[path as keyof typeof PATH_GRANTED_SKILL] : undefined;

    const effectiveSkillRanks = Object.fromEntries(
      SKILLS.map((k) => {
        const base = skillRanks[k] ?? 0;
        const eff = Math.min(5, Math.max(base, pathGranted === k ? 1 : 0));
        const attrKey = SKILL_ATTR[k];
        const attrVal = stats[attrKey] ?? 0;
        const checkValue = eff + attrVal;
        return [k, { base, effective: eff, attribute: attrKey, attributeValue: attrVal, checkValue }];
      })
    );

    return {
      keyTalent: keyTalent(ancestry, path),
      defenses: {
        physical: 10 + str + spd,
        cognitive: 10 + int + wil,
        spiritual: 10 + awa + pre,
      },
      capacities: {
        lifting: liftingCapacity(str),
        carrying: carryingCapacity(str),
      },
      movement: {
        rateFtPerAction: movementRate(spd),
        recoveryDie: recoveryDie(wil),
      },
      senses: {
        range: sensesRange(awa),
      },
      skills: effectiveSkillRanks,
    };
  }, [ancestry, path, stats, skillRanks]);

  const storeJson = useMemo(() => JSON.stringify(storeSnapshot, null, 2), [storeSnapshot]);
  const derivedJson = useMemo(() => JSON.stringify(derivedSnapshot, null, 2), [derivedSnapshot]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // optionally: toast
    } catch {
      // ignore
    }
  };

  const download = (filename: string, text: string) => {
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 text-2xl font-bold">Export</h1>
      <p className="mb-6 text-sm text-gray-600">
        Temporary debug panel showing the full CharacterStore snapshot and a derived summary.
      </p>

      {/* Raw store snapshot */}
      <section className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Store Snapshot (values only)</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
              onClick={() => copy(storeJson)}
            >
              Copy JSON
            </button>
            <button
              type="button"
              className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
              onClick={() => download("character-store.json", storeJson)}
            >
              Download JSON
            </button>
          </div>
        </div>
        <pre className="overflow-auto rounded-lg border bg-gray-50 p-3 text-xs leading-5">
{storeJson}
        </pre>
      </section>

      {/* Derived snapshot */}
      <section className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Derived Snapshot</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
              onClick={() => copy(derivedJson)}
            >
              Copy JSON
            </button>
            <button
              type="button"
              className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
              onClick={() => download("character-derived.json", derivedJson)}
            >
              Download JSON
            </button>
          </div>
        </div>
        <pre className="overflow-auto rounded-lg border bg-gray-50 p-3 text-xs leading-5">
{derivedJson}
        </pre>
      </section>
    </div>
  );
}

