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

type CharacterState = {
  name: string;
  ancestry: Ancestry;
  path: Path;
  setName: (name: string) => void;
  setAncestry: (a: Exclude<Ancestry, "">) => void;
  setPath: (p: Exclude<Path, "">) => void;
  reset: () => void;
};

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set) => ({
      name: "",
      ancestry: "",
      path: "",
      setName: (name) => set({ name }),
      setAncestry: (ancestry) => set({ ancestry }),
      setPath: (path) => set({ path }),
      reset: () => set({ name: "", ancestry: "", path: "" }),
    }),
    {
      name: "ccg-character",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

