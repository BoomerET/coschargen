// src/lib/store/character.ts
// Fully typed Zustand store for Cosmere Character Generator (no `any` casts).
// Includes: Basics, Stats, Expertises (Cultural + Additional), Skills (creation budget),
// Path Focus, Selected Path Talent (Human-only), derived helpers, and migrations.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ───────────────────────────────────────────────────────────────────────────────
// Domain types
// ───────────────────────────────────────────────────────────────────────────────

export type Ancestry = "" | "Human (Roshar)" | "Singer";

export type Path =
  | ""
  | "Agent"
  | "Envoy"
  | "Hunter"
  | "Leader"
  | "Scholar"
  | "Warrior";

export type PathFocus =
  | ""
  | "Investigator"
  | "Spy"
  | "Thief"
  | "Diplomat"
  | "Faithful"
  | "Mentor"
  | "Archer"
  | "Assassin"
  | "Tracker"
  | "Champion"
  | "Officer"
  | "Politico"
  | "Artifabrian"
  | "Strategist"
  | "Surgeon"
  | "Duelist"
  | "Shardbearer"
  | "Soldier";

export type StatKey = "STR" | "SPD" | "INT" | "WIL" | "AWA" | "PRE";
export type Stats = Record<StatKey, number>;

// Expertises
export type ArmorExpertise =
  | "Breastplate"
  | "Chain Armor"
  | "Half Plate"
  | "Leather"
  | "Shardplate";

export type WeaponExpertise =
  | "Axe"
  | "Crossbow"
  | "Grandbow"
  | "Greatsword"
  | "Half-Shard"
  | "Hammer"
  | "Javelin"
  | "Knife"
  | "Longbow"
  | "Longspear"
  | "Longsword"
  | "Mace"
  | "Poleaxe"
  | "Rapier"
  | "Shardblade"
  | "Shield"
  | "Shortbow"
  | "Shortspear"
  | "Sidesword"
  | "Sling"
  | "Staff"
  | "Unarmed Attacks"
  | "Warhammer";

export type CulturalExpertise =
  | "Alethi"
  | "Azish"
  | "Herdazian"
  | "High Society"
  | "Iriali"
  | "Kharbranthian"
  | "Listener"
  | "Military Life"
  | "Natan"
  | "Reshi"
  | "Shin"
  | "Thaylen"
  | "Underworld"
  | "Unkalaki"
  | "Veden"
  | "Wayfarer";

export type UtilityExpertise =
  | "Animal Care"
  | "Armor Crafting"
  | "Culinary Arts"
  | "Engineering"
  | "Equipment"
  | "History"
  | "Literature"
  | "Military"
  | "Religion"
  | "Riding Horses"
  | "Stormwardens"
  | "Visual Arts"
  | "Weapon Crafting";

export type AnyExpertise =
  | ArmorExpertise
  | WeaponExpertise
  | CulturalExpertise
  | UtilityExpertise;

// Skills
export type SkillKey =
  | "Agility"
  | "Athletics"
  | "Crafting"
  | "Deception"
  | "Deduction"
  | "Discipline"
  | "Heavy Weaponry"
  | "Insight"
  | "Intimidation"
  | "Leadership"
  | "Light Weaponry"
  | "Lore"
  | "Medicine"
  | "Perception"
  | "Persuasion"
  | "Stealth"
  | "Survival"
  | "Thievery";

export type SkillRanks = Record<SkillKey, number>;

// ───────────────────────────────────────────────────────────────────────────────
// Constants / helpers
// ───────────────────────────────────────────────────────────────────────────────

const ZERO_STATS: Stats = { STR: 0, SPD: 0, INT: 0, WIL: 0, AWA: 0, PRE: 0 };

const ZERO_SKILLS: SkillRanks = {
  Agility: 0,
  Athletics: 0,
  Crafting: 0,
  Deception: 0,
  Deduction: 0,
  Discipline: 0,
  "Heavy Weaponry": 0,
  Insight: 0,
  Intimidation: 0,
  Leadership: 0,
  "Light Weaponry": 0,
  Lore: 0,
  Medicine: 0,
  Perception: 0,
  Persuasion: 0,
  Stealth: 0,
  Survival: 0,
  Thievery: 0,
};

export const SKILL_ATTR: Record<SkillKey, StatKey> = {
  Agility: "SPD",
  Athletics: "STR",
  Crafting: "INT",
  Deception: "PRE",
  Deduction: "INT",
  Discipline: "WIL",
  "Heavy Weaponry": "STR",
  Insight: "AWA",
  Intimidation: "WIL",
  Leadership: "PRE",
  "Light Weaponry": "SPD",
  Lore: "INT",
  Medicine: "INT",
  Perception: "AWA",
  Persuasion: "PRE",
  Stealth: "SPD",
  Survival: "AWA",
  Thievery: "SPD",
};

// Key talent comes from Path (for both ancestries)
export type PathKeyTalent =
  | "Opportunist"
  | "Rousing Presence"
  | "Seek Quarry"
  | "Decisive Command"
  | "Erudition"
  | "Vigilant Stance";

export const PATH_KEY_TALENT: Record<Exclude<Path, "">, PathKeyTalent> = {
  Agent: "Opportunist",
  Envoy: "Rousing Presence",
  Hunter: "Seek Quarry",
  Leader: "Decisive Command",
  Scholar: "Erudition",
  Warrior: "Vigilant Stance",
};

// Path-granted skill floor (min 1 effective rank)
export const PATH_GRANTED_SKILL: Record<Exclude<Path, "">, SkillKey> = {
  Agent: "Insight",
  Envoy: "Discipline",
  Hunter: "Perception",
  Leader: "Leadership",
  Scholar: "Lore",
  Warrior: "Athletics",
};

// Helper: Effective skill rank (applies Path floor of 1)
export function getEffectiveSkillRank(
  state: CharacterState,
  key: SkillKey
): number {
  const base = state.skillRanks[key] ?? 0;
  const granted = state.path ? PATH_GRANTED_SKILL[state.path] : undefined;
  const isPathSkill = granted === key;
  return Math.min(5, Math.max(base, isPathSkill ? 1 : 0));
}

// Returns the skill granted by the current Path (works for Humans and Singers alike)
export function getPathGrantedSkill(state: CharacterState): SkillKey | null {
  const p = state.path;
  return p ? PATH_GRANTED_SKILL[p] : null;
}

// Creation cost: the first rank of the path-granted skill is free.
// Base is 0..2 during creation.
//  - If key === pathGranted: cost(base=0|1)=0, cost(base=2)=1
//  - Else: cost(base)=base
export function creationSkillCost(
  state: CharacterState,
  key: SkillKey,
  base: number
): number {
  const granted = getPathGrantedSkill(state);
  if (granted === key) return Math.max(0, base - 1);
  return base;
}

export function totalCreationSkillPoints(state: CharacterState): number {
  return (Object.entries(state.skillRanks) as [SkillKey, number][]).reduce(
    (sum, [k, v]) => sum + creationSkillCost(state, k, v),
    0
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// Store shape
// ───────────────────────────────────────────────────────────────────────────────

export type CharacterState = {
  // Basics
  name: string;
  ancestry: Ancestry;
  path: Path;
  pathFocus: PathFocus;
  level: number;

  // Stats (0..3, total budget 12)
  stats: Stats;
  totalStatPoints: number;

  // Expertises
  culturalExpertises: CulturalExpertise[]; // pick at least 2
  generalExpertises: AnyExpertise[]; // up to INT, requires 2 Cultural first

  // Skills (creation budget: 4 points, cap 2 per skill)
  skillRanks: SkillRanks; // base ranks (0..2 during creation)
  skillPointsTotal: number;

  // Talents
  selectedPathTalent: string; // Human-only additional pick
  setSelectedPathTalent: (t: string) => void;

  // Setters — basics
  setName: (v: string) => void;
  setAncestry: (v: Exclude<Ancestry, "">) => void;
  setPath: (v: Exclude<Path, "">) => void;
  setPathFocus: (v: Exclude<PathFocus, "">) => void;
  setLevel: (lvl: number) => void;

  // Setters — stats
  setStat: (key: StatKey, value: number) => void;
  adjustStat: (key: StatKey, delta: 1 | -1) => void;
  resetStats: () => void;

  // Setters — expertises
  toggleCultural: (e: CulturalExpertise) => void;
  toggleGeneral: (e: AnyExpertise) => void;
  clearExpertises: () => void;

  // Setters — skills
  setSkillRank: (key: SkillKey, v: number) => void;
  resetSkills: () => void;

  // Global reset
  reset: () => void;
};

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      // Basics
      name: "",
      ancestry: "",
      path: "",
      pathFocus: "",
      level: 1,

      // Stats
      stats: { ...ZERO_STATS },
      totalStatPoints: 12,

      // Expertises
      culturalExpertises: [],
      generalExpertises: [],

      // Skills
      skillRanks: { ...ZERO_SKILLS },
      skillPointsTotal: 4,

      // Talents
      selectedPathTalent: "",
      setSelectedPathTalent: (t) => set({ selectedPathTalent: t }),

      // ── Basics setters ──
      setName: (v) => set({ name: v }),
      setAncestry: (v) => set({ ancestry: v, selectedPathTalent: "" }),
      setPath: (v) =>
        set(() => ({
          path: v,
          pathFocus: "",
          selectedPathTalent: "", // clear human pick when path changes
        })),
      //setPathFocus: (v) => set({ pathFocus: v }),
      setPathFocus: (v) => set({ pathFocus: v, selectedPathTalent: "" }),
      setLevel: (lvl) =>
        set({ level: Math.max(1, Math.min(21, Math.floor(lvl))) }),

      // ── Stats setters ──
      setStat: (key, raw) =>
        set((state) => {
          const value = Math.max(0, Math.min(3, Math.floor(raw)));
          const usedWithoutThis = (
            Object.entries(state.stats) as [StatKey, number][]
          )
            .filter(([k]) => k !== key)
            .reduce((s, [, v]) => s + v, 0);
          const cap = Math.min(3, state.totalStatPoints - usedWithoutThis);
          const finalVal = Math.max(0, Math.min(value, cap));

          // If INT changed, trim generalExpertises to the new INT cap.
          let newGeneral = state.generalExpertises;
          if (key === "INT") {
            newGeneral = state.generalExpertises.slice(0, finalVal);
          }

          return {
            stats: { ...state.stats, [key]: finalVal },
            generalExpertises: newGeneral,
          };
        }),

      adjustStat: (key, delta) =>
        set((state) => {
          const cur = state.stats[key];
          if (delta === 1) {
            const used = Object.values(state.stats).reduce((s, v) => s + v, 0);
            if (used >= state.totalStatPoints || cur >= 3) return {};
            const next = cur + 1;
            return {
              stats: { ...state.stats, [key]: next },
              generalExpertises:
                key === "INT"
                  ? state.generalExpertises.slice(0, next)
                  : state.generalExpertises,
            };
          } else {
            if (cur <= 0) return {};
            const next = cur - 1;
            return {
              stats: { ...state.stats, [key]: next },
              generalExpertises:
                key === "INT"
                  ? state.generalExpertises.slice(0, next)
                  : state.generalExpertises,
            };
          }
        }),

      resetStats: () =>
        set({ stats: { ...ZERO_STATS }, generalExpertises: [] }),

      // ── Expertises ──
      toggleCultural: (e) =>
        set((state) => {
          const intCap = state.stats.INT ?? 0;
          const totalAllowed = 2 + intCap; // 2 required + INT more
          const totalSelected =
            state.culturalExpertises.length + state.generalExpertises.length;

          const inCultural = state.culturalExpertises.some((x) => x === e);
          if (inCultural) {
            // Allow deselect; UI gates will encourage re-filling to 2.
            return {
              culturalExpertises: state.culturalExpertises.filter(
                (x) => x !== e
              ),
            };
          } else {
            if (totalSelected >= totalAllowed) return {};
            // Remove from general if present (no duplicates)
            const generalWithoutDup = state.generalExpertises.filter(
              (x) => x !== e
            );
            return {
              culturalExpertises: [...state.culturalExpertises, e],
              generalExpertises: generalWithoutDup,
            };
          }
        }),

      toggleGeneral: (e) =>
        set((state) => {
          const intCap = state.stats.INT ?? 0;

          const inGeneral = state.generalExpertises.some((x) => x === e);
          const inCultural = state.culturalExpertises.some((x) => x === e);

          if (inGeneral) {
            return {
              generalExpertises: state.generalExpertises.filter((x) => x !== e),
            };
          }

          // Must have at least 2 Cultural before any Additional
          if (state.culturalExpertises.length < 2) return {};
          if (inCultural) return {}; // no duplicates with Cultural
          if (state.generalExpertises.length >= intCap) return {}; // cap to INT

          return { generalExpertises: [...state.generalExpertises, e] };
        }),

      clearExpertises: () =>
        set({ culturalExpertises: [], generalExpertises: [] }),

      // ── Skills ──

      setSkillRank: (key, raw) =>
        set((state) => {
          const desiredBase = Math.max(0, Math.min(2, Math.floor(raw)));
          const currentBase = state.skillRanks[key] ?? 0;

          // Points spent on other skills, using creationSkillCost
          const spentWithoutThis = (
            Object.entries(state.skillRanks) as [SkillKey, number][]
          )
            .filter(([k]) => k !== key)
            .reduce((s, [k, v]) => s + creationSkillCost(state, k, v), 0);

          const remaining = state.skillPointsTotal - spentWithoutThis;

          // Find the highest base ≤ desiredBase that fits in the remaining budget
          let finalBase = currentBase;
          for (let candidate = desiredBase; candidate >= 0; candidate--) {
            const candCost = creationSkillCost(state, key, candidate);
            const currCost = creationSkillCost(state, key, currentBase);
            if (candCost <= currCost + Math.max(0, remaining)) {
              finalBase = candidate;
              break;
            }
          }
          if (finalBase === currentBase) return {};
          return { skillRanks: { ...state.skillRanks, [key]: finalBase } };
        }),

      resetSkills: () => set({ skillRanks: { ...ZERO_SKILLS } }),

      // ── Global reset ──
      reset: () =>
        set({
          name: "",
          ancestry: "",
          path: "",
          pathFocus: "",
          level: 1,
          stats: { ...ZERO_STATS },
          culturalExpertises: [],
          generalExpertises: [],
          skillRanks: { ...ZERO_SKILLS },
          selectedPathTalent: "",
        }),
    }),
    {
      name: "ccg-character",
      storage: createJSONStorage(() => localStorage),
      version: 9, // bump if your project already used earlier versions
      migrate: (state: unknown, version: number) => {
        const prev = (state as Partial<CharacterState>) || {};
        const next: Partial<CharacterState> = { ...prev };

        // v2: stats + total
        if (version < 2) {
          next.stats = { ...ZERO_STATS };
          next.totalStatPoints = 12;
        }
        // v3: level
        if (version < 3 && next.level === undefined) {
          next.level = 1;
        }
        // v4: pathFocus
        if (version < 4 && next.pathFocus === undefined) {
          next.pathFocus = "";
        }
        // v5: expertises arrays
        if (version < 5) {
          if (!Array.isArray(next.culturalExpertises))
            next.culturalExpertises = [];
          if (!Array.isArray(next.generalExpertises))
            next.generalExpertises = [];
        }
        // v6: skillRanks
        if (version < 6 && !next.skillRanks) {
          next.skillRanks = { ...ZERO_SKILLS };
        }
        // v7: skillPointsTotal
        if (version < 7 && next.skillPointsTotal === undefined) {
          next.skillPointsTotal = 4;
        }
        // v9: selectedPathTalent
        if (version < 9 && next.selectedPathTalent === undefined) {
          next.selectedPathTalent = "";
        }

        // Ensure arrays exist
        if (!Array.isArray(next.culturalExpertises))
          next.culturalExpertises = [];
        if (!Array.isArray(next.generalExpertises)) next.generalExpertises = [];

        return next as CharacterState;
      },
    }
  )
);
