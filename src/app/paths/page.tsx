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
        <p className="text-sm text-gray-600">
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

      <div className="mb-6 rounded-xl border p-4">
        <p className="mt-1 text-lg font-semibold">{path}</p>
      </div>

      <fieldset className="mb-6">
        <legend className="mb-2 block text-sm font-medium text-gray-800">
          Speciality
        </legend>

        <div className="grid gap-2 sm:grid-cols-3">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 hover:bg-gray-50"
            >
              <input
                type="radio"
                name="pathFocus"
                value={opt}
                checked={pathFocus === opt}
                onChange={() => setPathFocus(opt)}
                className="h-4 w-4"
                aria-label={opt}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
