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

      setName: (name) => set({ name }),
      setAncestry: (ancestry) => set({ ancestry }),
      setLevel: (lvl) => {
        const n = Math.max(1, Math.min(21, Math.floor(lvl)));
        set({ level: n });
      },

      pathFocus: "",
      setPathFocus: (f) => set({ pathFocus: f }),

      setPath: (path) => set({ path, pathFocus: "" }),

      setStat: (key, raw) => {
        const value = Math.max(0, Math.min(3, Math.floor(raw)));
        const state = get();
        const usedWithoutThis = (
          Object.entries(state.stats) as [StatKey, number][]
        )
          .filter(([k]) => k !== key)
          .reduce((s, [, v]) => s + v, 0);
        const cap = Math.min(3, state.totalStatPoints - usedWithoutThis);
        const finalVal = Math.max(0, Math.min(value, cap));
        set({ stats: { ...state.stats, [key]: finalVal } });
      },

      adjustStat: (key, delta) => {
        const state = get();
        const current = state.stats[key];
        if (delta === 1) {
          const used = Object.values(state.stats).reduce((s, v) => s + v, 0);
          if (used >= state.totalStatPoints) return; // no points left
          if (current >= 3) return; // at per-attr cap
          set({ stats: { ...state.stats, [key]: current + 1 } });
        } else {
          if (current <= 0) return;
          set({ stats: { ...state.stats, [key]: current - 1 } });
        }
      },

      resetStats: () => set({ stats: { ...ZERO_STATS } }),

      reset: () =>
        set({
          name: "",
          ancestry: "",
          path: "",
          level: 1,
          stats: { ...ZERO_STATS },
        }),
    }),
    {
      name: "ccg-character",
      storage: createJSONStorage(() => localStorage),
      version: 4,
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
        return state;
      },
    }
  )
);
