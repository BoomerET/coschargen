// lib/store/character.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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

export type ArmorExpertise =
  | "Breastplate" | "Chain Armor" | "Half Plate" | "Leather" | "Shardplate";

export type WeaponExpertise =
  | "Axe" | "Crossbow" | "Grandbow" | "Greatsword" | "Half-Shard" | "Hammer"
  | "Javelin" | "Knife" | "Longbow" | "Longspear" | "Longsword" | "Mace"
  | "Poleaxe" | "Rapier" | "Shardblade" | "Shield" | "Shortbow" | "Shortspear"
  | "Sidesword" | "Sling" | "Staff" | "Unarmed Attacks" | "Warhammer";

export type CulturalExpertise =
  | "Alethi" | "Azish" | "Herdazian" | "High Society" | "Iriali"
  | "Kharbranthian" | "Listener" | "Military Life" | "Natan" | "Reshi"
  | "Shin" | "Thaylen" | "Underworld" | "Unkalaki" | "Veden" | "Wayfarer";

export const CULTURAL_SET = new Set<AnyExpertise>([
  "Alethi","Azish","Herdazian","High Society","Iriali","Kharbranthian","Listener",
  "Military Life","Natan","Reshi","Shin","Thaylen","Underworld","Unkalaki","Veden","Wayfarer",
]);

export type UtilityExpertise =
  | "Animal Care" | "Armor Crafting" | "Culinary Arts" | "Engineering"
  | "Equipment" | "History" | "Literature" | "Military" | "Religion"
  | "Riding Horses" | "Stormwardens" | "Visual Arts" | "Weapon Crafting";

export type AnyExpertise =
  | ArmorExpertise | WeaponExpertise | CulturalExpertise | UtilityExpertise;


export type StatKey = "STR" | "SPD" | "INT" | "WIL" | "AWA" | "PRE";
export type Stats = Record<StatKey, number>;

// --- Types (near your other exports) ---
export type SkillKey =
  | "Agility" | "Athletics" | "Crafting" | "Deception" | "Deduction" | "Discipline"
  | "Heavy Weaponry" | "Insight" | "Intimidation" | "Leadership" | "Light Weaponry"
  | "Lore" | "Medicine" | "Perception" | "Persuasion" | "Stealth" | "Survival" | "Thievery";

export type SkillRanks = Record<SkillKey, number>;

// Governing attribute for each skill
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

export const PATH_GRANTED_SKILL: Record<Exclude<Path, "">, SkillKey> = {
  Agent: "Insight",
  Envoy: "Discipline",
  Hunter: "Perception",
  Leader: "Leadership",
  Scholar: "Lore",
  Warrior: "Athletics",
};

// --- Defaults ---
const ZERO_SKILLS: SkillRanks = {
  Agility: 0, Athletics: 0, Crafting: 0, Deception: 0, Deduction: 0, Discipline: 0,
  "Heavy Weaponry": 0, Insight: 0, Intimidation: 0, Leadership: 0, "Light Weaponry": 0,
  Lore: 0, Medicine: 0, Perception: 0, Persuasion: 0, Stealth: 0, Survival: 0, Thievery: 0,
};


type CharacterState = {
  // Basics
  name: string;
  ancestry: Ancestry;
  path: Path;
  level: number;

  // Path focus
  pathFocus: PathFocus;
  setPathFocus: (f: Exclude<PathFocus, "">) => void;

  // Stats
  stats: Stats;
  totalStatPoints: number;

  // Expertises
  culturalExpertises: CulturalExpertise[]; // exactly 2
  generalExpertises: AnyExpertise[];       // exactly INT

  // Setters
  setName: (name: string) => void;
  setAncestry: (a: Exclude<Ancestry, "">) => void;
  setPath: (p: Exclude<Path, "">) => void;
  setLevel: (lvl: number) => void;

  // Stats setters
  setStat: (key: StatKey, value: number) => void;
  adjustStat: (key: StatKey, delta: 1 | -1) => void;
  resetStats: () => void;

  skillRanks: SkillRanks;                 // base ranks you assign (0–5)
  setSkillRank: (key: SkillKey, v: number) => void;
  resetSkills: () => void;

  skillPointsTotal: number;
  // Global reset
  reset: () => void;
};

const ZERO_STATS: Stats = { STR: 0, SPD: 0, INT: 0, WIL: 0, AWA: 0, PRE: 0 };

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      // basics
      name: "",
      ancestry: "",
      path: "",
      level: 1,

      // stats
      stats: { ...ZERO_STATS },
      totalStatPoints: 12,

      // Expertises
      culturalExpertises: [],
      generalExpertises: [],

      setName: (name) => set({ name }),
      setAncestry: (ancestry) => set({ ancestry }),
      setLevel: (lvl) => {
        const n = Math.max(1, Math.min(21, Math.floor(lvl)));
        set({ level: n });
      },

      pathFocus: "",
      setPathFocus: (f) => set({ pathFocus: f }),

      setPath: (path) => set({ path, pathFocus: "" }),

      setStat: (key, raw) =>
        set((state) => {
          const value = Math.max(0, Math.min(3, Math.floor(raw)));
          const usedWithoutThis = (Object.entries(state.stats) as [StatKey, number][])
            .filter(([k]) => k !== key)
            .reduce((s, [, v]) => s + v, 0);
          const cap = Math.min(3, state.totalStatPoints - usedWithoutThis);
          const finalVal = Math.max(0, Math.min(value, cap));

          let newGeneral = state.generalExpertises;
          if (key === "INT") {
            // trim to new INT cap
            newGeneral = state.generalExpertises.slice(0, finalVal);
          }

          return {
            stats: { ...state.stats, [key]: finalVal },
            generalExpertises: newGeneral,
          };
        }),

      skillRanks: { ...ZERO_SKILLS },
      skillPointTotal: 4,


      setSkillRank: (key, raw) =>
  set((state) => {
    const current = state.skillRanks[key] ?? 0;

    // clamp requested value to 0..2 (creation cap)
    let desired = Math.max(0, Math.min(2, Math.floor(raw)));

    // how many points are spent on OTHER skills
    const spentWithoutThis = (Object.entries(state.skillRanks) as [SkillKey, number][])
      .filter(([k]) => k !== key)
      .reduce((s, [, v]) => s + v, 0);

    // you can increase this skill by at most the remaining budget
    const remaining = state.skillPointsTotal - spentWithoutThis;

    // final cap for this field = min(2, current + remaining)
    const capForThis = Math.min(2, current + Math.max(0, remaining));

    const final = Math.max(0, Math.min(desired, capForThis));

    // no-op if unchanged
    if (final === current) return {};
    return { skillRanks: { ...state.skillRanks, [key]: final } };
  }),

    resetSkills: () => set({ skillRanks: { ...ZERO_SKILLS } }),
 
      adjustStat: (key, delta) =>
        set((state) => {
          const current = state.stats[key];
          if (delta === 1) {
            const used = Object.values(state.stats).reduce((s, v) => s + v, 0);
            if (used >= state.totalStatPoints || current >= 3) return {};
            const next = current + 1;
            let gen = state.generalExpertises;
            if (key === "INT") gen = gen.slice(0, next);
            return { stats: { ...state.stats, [key]: next }, generalExpertises: gen };
          } else {
            if (current <= 0) return {};
            const next = current - 1;
            let gen = state.generalExpertises;
            if (key === "INT") gen = gen.slice(0, next);
            return { stats: { ...state.stats, [key]: next }, generalExpertises: gen };
          }
        }),

      resetStats: () => set({ stats: { ...ZERO_STATS }, generalExpertises: [] }),

      // Expertise toggles
      // Replace toggleCultural with this:
toggleCultural: (e) =>
  set((state) => {
    const inCultural = state.culturalExpertises.includes(e as any);
    const intCap = state.stats.INT ?? 0;
    const totalAllowed = 2 + intCap;
    const totalSelected =
      state.culturalExpertises.length + state.generalExpertises.length;

    if (inCultural) {
      // ✅ Allow deselect even if it drops below 2 (lets you change your mind)
      return {
        culturalExpertises: state.culturalExpertises.filter((x) => x !== (e as any)),
      };
    } else {
      // Adding a Cultural pick respects the overall cap 2 + INT
      if (totalSelected >= totalAllowed) return {};
      // No duplicates across sets
      const generalWithoutDup = state.generalExpertises.filter((x) => x !== (e as any));
      return {
        culturalExpertises: [...state.culturalExpertises, e as any],
        generalExpertises: generalWithoutDup,
      };
    }
  }),

// Replace toggleGeneral with this:
toggleGeneral: (e) =>
  set((state) => {
    const inCultural = state.culturalExpertises.includes(e as any);
    const inGeneral = state.generalExpertises.includes(e as any);
    const intCap = state.stats.INT ?? 0;

    if (inGeneral) {
      // deselect any time
      return {
        generalExpertises: state.generalExpertises.filter((x) => x !== (e as any)),
      };
    }

    // ✅ HARD GATE: must pick 2 Cultural before ANY Additional
    if (state.culturalExpertises.length < 2) return {};

    // No duplicates with Cultural
    if (inCultural) return {};

    // Cap general picks to INT
    if (state.generalExpertises.length >= intCap) return {};

    return { generalExpertises: [...state.generalExpertises, e as any] };
  }),


      clearExpertises: () => set({ culturalExpertises: [], generalExpertises: [] }),

      reset: () =>
        set({
          name: "",
          ancestry: "",
          path: "",
          level: 1,
          stats: { ...ZERO_STATS },
          culturalExpertises: [],
          generalExpertises: [],
        }),
    }),
    {
      name: "ccg-character",
      storage: createJSONStorage(() => localStorage),
      version: 7,
      migrate: (state: any, version) => {
        if (version < 2) {
          state = {
            ...state,
            stats: { STR: 0, SPD: 0, INT: 0, WIL: 0, AWA: 0, PRE: 0 },
            totalStatPoints: 12,
          };
        }
        if (version < 3) state = { ...state, level: 1 };
        if (version < 4) state = { ...state, pathFocus: "" };
        if (version < 5) state = { ...state, culturalExpertises: [], generalExpertises: [] };
        if (version < 6) state = { ...state, skillRanks: { ...ZERO_SKILLS } };
        if (version < 7) state = { ...state, skillPointsTotal: 4 };
        return state;
      },
    }
  )
);
