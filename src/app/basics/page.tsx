// src/app/basics/page.tsx
"use client";

import { RotateCcw } from "lucide-react";
import {
  useCharacterStore,
  type Ancestry,
  type Path,
} from "@/lib/store/character";

const ANCESTRIES = ["Human (Roshar)", "Singer"] as const satisfies Exclude<
  Ancestry,
  ""
>[];
const PATHS = [
  "Agent",
  "Envoy",
  "Hunter",
  "Leader",
  "Scholar",
  "Warrior",
] as const satisfies Exclude<Path, "">[];

export default function BasicsPage() {
  const {
    name,
    ancestry,
    path,
    setName,
    setAncestry,
    setPath,
    level,
    setLevel,
    reset, // store action
  } = useCharacterStore();

  // Robust reset: confirm, reset store, clear persisted cache (if present), rehydrate.
  async function onResetAll() {
    if (
      !window.confirm(
        "Reset ALL character data? This clears Basics, Stats, Expertises, Skills, and Talents."
      )
    ) {
      return;
    }
    reset();

    // Safely access zustand-persist helpers if available (no 'any' casts)
    const storeRef = useCharacterStore as unknown as {
      persist?: {
        clearStorage?: () => void | Promise<void>;
        rehydrate?: () => void | Promise<void>;
      };
    };
    try {
      await storeRef.persist?.clearStorage?.();
      await storeRef.persist?.rehydrate?.();
    } catch {
      // ignore if persist isn't attached or storage is blocked
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header with Reset All */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Basics</h1>
        <button
          type="button"
          onClick={onResetAll}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-slate-800"
          title="Reset all character data"
        >
          <RotateCcw className="h-4 w-4" />
          Reset All
        </button>
      </div>

      {/* Name */}
      <div className="mb-6">
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200"
        >
          Player Character Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Enter a character name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="
            w-full rounded-lg border px-3 py-2
            border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-gray-400/30
            dark:border-gray-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500
            dark:focus:ring-slate-600/40
          "
        />
      </div>

      {/* Level */}
      <div className="mb-6">
        <label
          htmlFor="level"
          className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200"
        >
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
            setLevel(Number.isNaN(n) ? 1 : n);
          }}
          onBlur={(e) => {
            if (e.currentTarget.value === "") setLevel(1);
          }}
          className="
            w-24 rounded-lg border px-2 py-1 text-center
            border-gray-300 bg-white text-gray-900
            focus:outline-none focus:ring-2 focus:ring-gray-400/30
            dark:border-gray-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-slate-600/40
          "
          aria-describedby="level-hint"
        />
      </div>

      {/* Ancestry */}
      <fieldset className="mb-6 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
        <legend className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Ancestry (select one)
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {ANCESTRIES.map((opt) => (
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
                name="ancestry"
                value={opt}
                checked={ancestry === opt}
                onChange={() => setAncestry(opt)}
                className="h-4 w-4 accent-indigo-600 dark:accent-indigo-400"
                aria-label={opt}
              />
              <span className="text-gray-800 dark:text-gray-200">{opt}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Path */}
      <fieldset className="mb-6 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
        <legend className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
          Path (select one)
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {PATHS.map((opt) => (
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
                name="path"
                value={opt}
                checked={path === opt}
                onChange={() => setPath(opt)}
                className="h-4 w-4 accent-indigo-600 dark:accent-indigo-400"
                aria-label={opt}
              />
              <span className="text-gray-800 dark:text-gray-200">{opt}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Selections are saved automatically.
      </p>
    </div>
  );
}

