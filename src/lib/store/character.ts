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

export type UtilityExpertise =
  | "Animal Care" | "Armor Crafting" | "Culinary Arts" | "Engineering"
  | "Equipment" | "History" | "Literature" | "Military" | "Religion"
  | "Riding Horses" | "Stormwardens" | "Visual Arts" | "Weapon Crafting";

export type AnyExpertise =
  | ArmorExpertise | WeaponExpertise | CulturalExpertise | UtilityExpertise;


export type StatKey = "STR" | "SPD" | "INT" | "WIL" | "AWA" | "PRE";
export type Stats = Record<StatKey, number>;

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
      toggleCultural: (e) =>
  set((state) => {
    const inCultural = state.culturalExpertises.includes(e);
    const intCap = state.stats.INT ?? 0;
    const totalAllowed = 2 + intCap; // 2 required + INT more
    const totalSelected =
      state.culturalExpertises.length + state.generalExpertises.length;

    if (inCultural) {
      // Allow deselect, but keep at least 2 Cultural
      if (state.culturalExpertises.length <= 2) return {};
      return {
        culturalExpertises: state.culturalExpertises.filter((x) => x !== e),
      };
    } else {
      // Selecting a new Cultural:
      // - Respect overall cap (2 + INT)
      // - Remove from general if present (no dupes)
      if (totalSelected >= totalAllowed) return {};
      const generalWithoutDup = state.generalExpertises.filter((x) => x !== e);
      return {
        culturalExpertises: [...state.culturalExpertises, e],
        generalExpertises: generalWithoutDup,
      };
    }
  }),

toggleGeneral: (e) =>
  set((state) => {
    const inCultural = state.culturalExpertises.includes(e);
    const inGeneral = state.generalExpertises.includes(e);
    const intCap = state.stats.INT ?? 0;
    const totalAllowed = 2 + intCap;
    const totalSelected =
      state.culturalExpertises.length + state.generalExpertises.length;

    if (inGeneral) {
      // deselect
      return {
        generalExpertises: state.generalExpertises.filter((x) => x !== e),
      };
    }
    // Don’t allow duplicates with Cultural
    if (inCultural) return {};
    // Respect overall cap
    if (totalSelected >= totalAllowed) return {};
    return { generalExpertises: [...state.generalExpertises, e] };
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
      version: 5,
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
        return state;
      },
    }
  )
);
