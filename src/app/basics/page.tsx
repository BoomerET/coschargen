// app/basics/page.tsx
"use client";

import Link from "next/link";
import { useCharacterStore, type Ancestry, type Path } from "@/lib/store/character";

const ANCESTRIES = ["Human (Roshar)", "Singer"] as const satisfies Exclude<Ancestry, "">[];
const PATHS = ["Agent", "Envoy", "Hunter", "Leader", "Scholar", "Warrior"] as const satisfies Exclude<Path, "">[];

export default function BasicsPage() {
  const { name, ancestry, path, setName, setAncestry, setPath, level, setLevel, reset } = useCharacterStore();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Basics</h1>

      {/* Name */}
      <div className="mb-6">
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-800">
          Player Character Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Enter a character name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 outline-none ring-0 focus:border-gray-400"
        />
      </div>
      <div className="mb-6">
  <label htmlFor="level" className="mb-2 block text-sm font-medium text-gray-800">
    Level
  </label>
  <input
    id="level"
    type="number"
    inputMode="numeric"
    min={1}
    max={21}
    step={1}
    value={level}
    onChange={(e) => {
      const n = Number(e.target.value);
      setLevel(isNaN(n) ? 1 : n); // setter clamps 1–21
    }}
    onBlur={(e) => {
      if (e.currentTarget.value === "") setLevel(1);
    }}
    className="w-24 rounded-lg border px-2 py-1 text-center"
    aria-describedby="level-hint"
  />
</div>

      {/* Ancestry */}
      <fieldset className="mb-6">
        <legend className="mb-2 block text-sm font-medium text-gray-800">
          Ancestry (select one)
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {ANCESTRIES.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 hover:bg-gray-50">
              <input
                type="radio"
                name="ancestry"
                value={opt}
                checked={ancestry === opt}
                onChange={() => setAncestry(opt)}
                className="h-4 w-4"
                aria-label={opt}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Path */}
      <fieldset className="mb-6">
        <legend className="mb-2 block text-sm font-medium text-gray-800">
          Path (select one)
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {PATHS.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 hover:bg-gray-50">
              <input
                type="radio"
                name="path"
                value={opt}
                checked={path === opt}
                onChange={() => setPath(opt)}
                className="h-4 w-4"
                aria-label={opt}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Clear
        </button>
        <span className="text-sm text-gray-500">Selections are saved automatically.</span>
      </div>
    </div>
  );
}

