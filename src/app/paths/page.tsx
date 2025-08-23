// app/paths/page.tsx
"use client";

import Link from "next/link";
import {
  useCharacterStore,
  type Path,
  type PathFocus,
} from "@/lib/store/character";

const FOCI: Record<Exclude<Path, "">, readonly Exclude<PathFocus, "">[]> = {
  Agent: ["Investigator", "Spy", "Thief"],
  Envoy: ["Diplomat", "Faithful", "Mentor"],
  Hunter: ["Archer", "Assassin", "Tracker"],
  Leader: ["Champion", "Officer", "Politico"],
  Scholar: ["Artifabrian", "Strategist", "Surgeon"],
  Warrior: ["Duelist", "Shardbearer", "Soldier"],
} as const;

export default function PathsPage() {
  const { path, pathFocus, setPathFocus } = useCharacterStore();

  if (!path) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold">Paths</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose a Path on the{" "}
          <Link href="/basics" className="underline">
            Basics
          </Link>{" "}
          page first, then return here to select a focus.
        </p>
      </div>
    );
  }

  const options = FOCI[path as Exclude<Path, "">];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold">Paths</h1>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-gray-700 dark:bg-slate-900/60">
        <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-gray-200">
          {path}
        </p>
      </div>

      <fieldset className="mb-6">
        <legend className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Specialty
        </legend>

        <div className="grid gap-2 sm:grid-cols-3">
          {options.map((opt) => (
            <label
              key={opt}
              className="
                flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2
                border-gray-200 bg-white/80 hover:bg-gray-50
                dark:border-gray-700 dark:bg-slate-900/60 dark:hover:bg-slate-800
              "
            >
              <input
                type="radio"
                name="pathFocus"
                value={opt}
                checked={pathFocus === opt}
                onChange={() => setPathFocus(opt)}
                className="h-4 w-4 accent-indigo-600 dark:accent-indigo-400"
                aria-label={opt}
              />
              <span className="text-gray-800 dark:text-gray-200">{opt}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

