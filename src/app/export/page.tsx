// src/app/export/page.tsx
"use client";

import { useMemo } from "react";
import {
  useCharacterStore,
  SKILL_ATTR,
  PATH_GRANTED_SKILL,
  PATH_KEY_TALENT,
  type SkillKey,
  type StatKey,
  type Path,
  type PathFocus,
} from "@/lib/store/character";

function isFunction(x: unknown): x is (...args: unknown[]) => unknown {
  return typeof x === "function";
}

/** FG stat labels expect lowercase full names (e.g., "awareness"). */
const FG_STAT_LABEL: Record<StatKey, string> = {
  STR: "strength",
  SPD: "speed",
  INT: "intellect",
  WIL: "willpower",
  AWA: "awareness",
  PRE: "presence",
};

const SKILLS: SkillKey[] = [
  "Agility","Athletics","Crafting","Deception","Deduction","Discipline",
  "Heavy Weaponry","Insight","Intimidation","Leadership","Light Weaponry",
  "Lore","Medicine","Perception","Persuasion","Stealth","Survival","Thievery",
];

// ───────────────────────────────────────────────────────────────────────────────
// Derived helpers (same logic you use elsewhere)
// ───────────────────────────────────────────────────────────────────────────────

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
  if (a === 0) return "5 feet";
  if (a <= 2) return "10 feet";
  if (a <= 4) return "20 feet";
  if (a <= 6) return "50 feet";
  if (a <= 8) return "100 feet";
  return "Unaffected by obscured senses";
}
function defenses(stats: Record<StatKey, number>) {
  const { STR, SPD, INT, WIL, AWA, PRE } = stats;
  return {
    physical: 10 + (STR ?? 0) + (SPD ?? 0),
    cognitive: 10 + (INT ?? 0) + (WIL ?? 0),
    spiritual: 10 + (AWA ?? 0) + (PRE ?? 0),
  };
}
function effectiveRank(base: number, isPathSkill: boolean): number {
  return Math.min(5, Math.max(base, isPathSkill ? 1 : 0));
}
function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
// Turn "1d8" -> "d8" for <recdie type="dice">d8</recdie>
function asFgDie(die: string): string {
  return die.startsWith("1d") ? "d" + die.slice(2) : die.replace(/^1/, "");
}

// ───────────────────────────────────────────────────────────────────────────────
// Build Fantasy Grounds XML using StreetUrchin.xml as a template
// ───────────────────────────────────────────────────────────────────────────────

function buildFantasyGroundsXml(allValues: Record<string, unknown>) {
  const name = (allValues.name as string) || "Unnamed Hero";
  const ancestry = (allValues.ancestry as string) || "";
  const level = (allValues.level as number) ?? 1;
  const path = (allValues.path as Path) || "";
  const pathFocus = (allValues.pathFocus as PathFocus) || "";
  const stats = (allValues.stats as Record<StatKey, number>) || {
    STR: 0, SPD: 0, INT: 0, WIL: 0, AWA: 0, PRE: 0,
  };
  const skillRanks = (allValues.skillRanks as Record<SkillKey, number>) || {};
  const cultural = (allValues.culturalExpertises as string[]) || [];
  const additional = (allValues.generalExpertises as string[]) || [];
  const selectedPathTalent = (allValues.selectedPathTalent as string) || "";

  const keyTalent = path ? PATH_KEY_TALENT[path as Exclude<Path, "">] : undefined;

  const derivedDef = defenses(stats);
  const move = movementRate(stats.SPD ?? 0);
  const recDie = asFgDie(recoveryDie(stats.WIL ?? 0));
  const senses = sensesRange(stats.AWA ?? 0);

  const pathGrantedSkill = path ? PATH_GRANTED_SKILL[path as Exclude<Path, "">] : undefined;

  // <skilllist>
  let skillListXml = "";
  let totalSkillRanks = 0;

  SKILLS.forEach((k, idx) => {
    const base = skillRanks[k] ?? 0;
    totalSkillRanks += base;
    const isPathSkill = pathGrantedSkill === k;
    const eff = effectiveRank(base, isPathSkill);
    const attrKey = SKILL_ATTR[k];
    const attrVal = stats[attrKey] ?? 0;
    const total = eff + (attrVal ?? 0);
    const id = String(idx + 1).padStart(5, "0");

    skillListXml += `
      <id-${id}>
        <bonus type="number">0</bonus>
        <name type="string">${xmlEscape(k)}</name>
        <rank type="number">${base}</rank>
        <stat type="string">${FG_STAT_LABEL[attrKey]}</stat>
        <total type="number">${total}</total>
      </id-${id}>`;
  });

  // <expertise>
  let expertiseXml = "";
  const allExps = [...cultural, ...additional];
  allExps.forEach((ex, i) => {
    const id = String(i + 1).padStart(5, "0");
    expertiseXml += `
      <id-${id}>
        <name type="string">${xmlEscape(ex)}</name>
      </id-${id}>`;
  });

  // <talent> (Path Key, Singer Change Form, Human extra pick)
  const talentItems: Array<{ name: string; source?: string; specialty?: string; activation?: string; }> = [];
  if (keyTalent) {
    talentItems.push({ name: keyTalent, source: path || "", activation: "[*]" });
  }
  if (ancestry === "Singer") {
    talentItems.push({ name: "Change Form", source: "Singer", activation: "[*]" });
  }
  if (selectedPathTalent) {
    talentItems.push({
      name: selectedPathTalent, source: path || "", specialty: pathFocus || undefined, activation: "[*]",
    });
  }
  const totalTalents = talentItems.length;

  let talentXml = "";
  talentItems.forEach((t, i) => {
    const id = String(i + 1).padStart(5, "0");
    talentXml += `
      <id-${id}>
        <activation type="string">${xmlEscape(t.activation ?? "[*]")}</activation>
        <name type="string">${xmlEscape(t.name)}</name>
        ${t.source ? `<source type="string">${xmlEscape(t.source)}</source>` : ""}
        ${t.specialty ? `<specialty type="string">${xmlEscape(t.specialty)}</specialty>` : ""}
      </id-${id}>`;
  });

  const pathLine = path ? `${path}${pathFocus ? `(${pathFocus})` : ""}` : "";

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<root version="4.8" dataversion="20241002" release="8.1|CoreRPG:7">
  <character>
    <name type="string">${xmlEscape(name)}</name>
    ${ancestry ? `
    <ancestry>
      <name type="string">${xmlEscape(ancestry)}</name>
    </ancestry>` : ""}

    <level type="number">${level}</level>
    ${pathLine ? `<path type="string">${xmlEscape(pathLine)}</path>` : ""}

    <attributes>
      <awareness><score type="number">${stats.AWA ?? 0}</score></awareness>
      <intellect><score type="number">${stats.INT ?? 0}</score></intellect>
      <presence><score type="number">${stats.PRE ?? 0}</score></presence>
      <speed><score type="number">${stats.SPD ?? 0}</score></speed>
      <strength><score type="number">${stats.STR ?? 0}</score></strength>
      <willpower><score type="number">${stats.WIL ?? 0}</score></willpower>
    </attributes>

    <defenses>
      <cognitivedefense><score type="number">${derivedDef.cognitive}</score></cognitivedefense>
      <physicaldefense><score type="number">${derivedDef.physical}</score></physicaldefense>
      <spiritualdefense><score type="number">${derivedDef.spiritual}</score></spiritualdefense>
    </defenses>

    <movement type="number">${move}</movement>
    <recdie type="dice">${recDie}</recdie>
    <senses type="string">${xmlEscape(senses)}</senses>

    ${expertiseXml ? `<expertise>${expertiseXml}
    </expertise>` : ""}

    ${talentXml ? `<talent>${talentXml}
    </talent>` : ""}

    <skilllist>${skillListXml}
    </skilllist>

    <totalskillranks type="number">${totalSkillRanks}</totalskillranks>
    <totaltalents type="number">${totalTalents}</totaltalents>
  </character>
</root>`.replace(/[ \t]+\n/g, "\n");
  return xml;
}

// ───────────────────────────────────────────────────────────────────────────────

export default function ExportPage() {
  const all = useCharacterStore();

  const valuesOnly = useMemo(() => {
    const entries = Object.entries(all as Record<string, unknown>).filter(
      ([, v]) => !isFunction(v)
    );
    return Object.fromEntries(entries);
  }, [all]);

  const derivedSkills = useMemo(() => {
    const stats = valuesOnly.stats as Record<StatKey, number> | undefined;
    const path = valuesOnly.path as Path | undefined;
    const skillRanks = valuesOnly.skillRanks as Record<SkillKey, number> | undefined;
    if (!stats || !skillRanks) return {};

    const pathGranted = path ? PATH_GRANTED_SKILL[path as Exclude<Path, "">] : undefined;

    return Object.fromEntries(
      SKILLS.map((k) => {
        const base = skillRanks[k] ?? 0;
        const isPathSkill = pathGranted === k;
        const eff = effectiveRank(base, isPathSkill);
        const attrKey = SKILL_ATTR[k];
        const attrVal = stats[attrKey] ?? 0;
        return [k, { base, effective: eff, attribute: attrKey, attributeValue: attrVal, final: eff + attrVal }];
      })
    );
  }, [valuesOnly]);

  const exportPayload = useMemo(
    () => ({
      ...valuesOnly,
      derived: {
        skillsFinal: derivedSkills,
        _note: "final = effectiveRank + governingAttribute; effective applies Path floor of 1 if applicable",
      },
      _exportedAt: new Date().toISOString(),
    }),
    [valuesOnly, derivedSkills]
  );

  const json = useMemo(() => JSON.stringify(exportPayload, null, 2), [exportPayload]);

  const copyJson = async () => {
    try { await navigator.clipboard.writeText(json); } catch {}
  };
  const downloadJson = () => {
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "character-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const downloadFantasyGroundsXml = () => {
    const xml = buildFantasyGroundsXml(valuesOnly);
    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(valuesOnly.name as string) || "character"}_FG.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 text-2xl font-bold">Export</h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Live snapshot of everything in <code>CharacterStore</code>, plus a Fantasy Grounds export.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyJson}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-slate-800"
        >
          Copy JSON
        </button>
        <button
          type="button"
          onClick={downloadJson}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-slate-800"
        >
          Download JSON
        </button>
        <button
          type="button"
          onClick={downloadFantasyGroundsXml}
          className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white hover:opacity-90 dark:bg-slate-100 dark:text-slate-900"
        >
          Download Fantasy Grounds XML
        </button>
      </div>

      <pre className="overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs leading-5 dark:border-gray-700 dark:bg-slate-900/60 dark:text-slate-100">
{json}
      </pre>
    </div>
  );
}

