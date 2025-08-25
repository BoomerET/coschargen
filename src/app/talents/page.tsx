// src/app/talents/page.tsx
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Sparkles, Wand2 } from "lucide-react";
import {
  useCharacterStore,
  PATH_KEY_TALENT,
  type Path,
  type PathFocus,
  type PathKeyTalent,
} from "@/lib/store/character";

// --- Key Talent from Path (both ancestries) ---
function keyTalentFromPath(path: Path): PathKeyTalent | null {
  return path ? PATH_KEY_TALENT[path as Exclude<Path, "">] : null;
}

// All other paths' key talents (exclude the current path)
function otherPathKeyTalents(currentPath: Exclude<Path, "">): PathKeyTalent[] {
  const entries = Object.entries(PATH_KEY_TALENT) as [
    Exclude<Path, "">,
    PathKeyTalent
  ][];
  return entries.filter(([p]) => p !== currentPath).map(([, t]) => t);
}

// Human additional talent options based on Path + Specialty
function humanAdditionalTalentOptions(
  path: Exclude<Path, "">,
  focus: Exclude<PathFocus, ""> | ""
): readonly string[] {
  // Agent
  if (path === "Agent") {
    if (focus === "Investigator") {
      return ["Watchful Eye", "Get Em Talking", ...otherPathKeyTalents("Agent")] as const;
    } else if (focus === "Spy") {
      return ["Sure Outcome", "Plausible Excuse", ...otherPathKeyTalents("Agent")] as const;
    } else if (focus === "Thief") {
      return ["Risky Behavior", "Cheap Shot", ...otherPathKeyTalents("Agent")] as const;
    }
  }
  // Envoy
  else if (path === "Envoy") {
    if (focus === "Diplomat") {
      return ["Steadfast Challenge", "Collected", ...otherPathKeyTalents("Envoy")] as const;
    } else if (focus === "Faithful") {
      return ["Customary Garb", "Galvanize", ...otherPathKeyTalents("Envoy")] as const;
    } else if (focus === "Mentor") {
      return ["Sound Advice", "Practical Demonstration", ...otherPathKeyTalents("Envoy")] as const;
    }
  }
  // Hunter
  else if (path === "Hunter") {
    if (focus === "Archer") {
      return ["Tagging Shot", "Combat Training", ...otherPathKeyTalents("Hunter")] as const;
    } else if (focus === "Assassin") {
      return ["Startling Blow", "Killing Edge", ...otherPathKeyTalents("Hunter")] as const;
    } else if (focus === "Tracker") {
      return ["Deadly Trap", "Animal Bond", ...otherPathKeyTalents("Hunter")] as const;
    }
  }
  // Leader
  else if (path === "Leader") {
    if (focus === "Champion") {
      return ["Combat Coordination", "Valiant Intervention", ...otherPathKeyTalents("Leader")] as const;
    } else if (focus === "Officer") {
      return ["Composed", "Through the Fray", ...otherPathKeyTalents("Leader")] as const;
    } else if (focus === "Politico") {
      return ["Cutthroat Tactics", "Tactical Ploy", ...otherPathKeyTalents("Leader")] as const;
    }
  }
  // Scholar
  else if (path === "Scholar") {
    if (focus === "Artifabrian") {
      return ["Efficient Engineer", "Prized Acquisition", ...otherPathKeyTalents("Scholar")] as const;
    } else if (focus === "Strategist") {
      return ["Strategize", "Mind and Body", ...otherPathKeyTalents("Scholar")] as const;
    } else if (focus === "Surgeon") {
      return ["Field Medicine", "Emotional Intelligence", ...otherPathKeyTalents("Scholar")] as const;
    }
  }
  // Warrior
  else if (path === "Warrior") {
    if (focus === "Duelist") {
      return ["Practiced Kata", "Flamestance", ...otherPathKeyTalents("Warrior")] as const;
    } else if (focus === "Shardbearer") {
      return ["Shard Training", "Stonestance", ...otherPathKeyTalents("Warrior")] as const;
    } else if (focus === "Soldier") {
      return ["Cautious Advance", "Combat Training", ...otherPathKeyTalents("Warrior")] as const;
    }
  }
  return [] as const;
}

export default function TalentsPage() {
  const {
    ancestry,
    path,
    pathFocus,
    selectedPathTalent,
    setSelectedPathTalent,
  } = useCharacterStore();

  const keyTalent = useMemo(() => keyTalentFromPath(path as Path), [path]);

  const isSinger = ancestry === "Singer";
  const isHuman = ancestry === "Human (Roshar)";
  const hasBasics = !!ancestry && !!path;

  const humanOptions = useMemo(() => {
    if (!isHuman || !path || !pathFocus) return [] as const;
    return humanAdditionalTalentOptions(
      path as Exclude<Path, "">,
      pathFocus as Exclude<PathFocus, "">
    );
  }, [isHuman, path, pathFocus]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold">Talents</h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Your <strong>Key Talent</strong> is determined by your <strong>Path</strong> (Humans &amp; Singers).
        Singers also gain <strong>Change Form</strong>. Humans select one additional Path Talent once a{" "}
        <strong>Specialty</strong> is chosen.
      </p>

      {!hasBasics ? (
        <div className="rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-gray-700 dark:bg-slate-900/60">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Choose your <strong>Ancestry</strong> and <strong>Path</strong> on{" "}
            <Link href="/basics" className="underline">
              Basics
            </Link>
            , then return here.
          </p>
        </div>
      ) : (
        <>
          {/* Key Talent (from Path) */}
          <section className="mb-6 rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-gray-700 dark:bg-slate-900/60">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">Key Talent</div>
              <Sparkles className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden />
            </div>
            <div className="text-2xl font-semibold">{keyTalent ?? "—"}</div>
          </section>

          {/* Singer: fixed additional Talent */}
          {isSinger && (
            <section className="mb-6 rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-gray-700 dark:bg-slate-900/60">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">Additional Talent</div>
                <Wand2 className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden />
              </div>
              <div className="text-2xl font-semibold">Change Form</div>
            </section>
          )}

          {/* Human: additional talent — unlocked after Specialty */}
          {isHuman && (
            <section className="mb-6 rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-gray-700 dark:bg-slate-900/60">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">Additional Talent (Human)</div>
                <Wand2 className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden />
              </div>

              {!pathFocus ? (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Choose a <strong>Specialty</strong> on the{" "}
                  <Link href="/paths" className="underline">Paths</Link> page to unlock this choice.
                </p>
              ) : humanOptions.length === 0 ? (
                <>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    No options defined yet for <strong>{path}</strong> → <strong>{pathFocus}</strong>.
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Once you provide the options, the selector will enable.
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="human-path-talent"
                    className="text-sm text-gray-700 dark:text-gray-200"
                  >
                    Choose one:
                  </label>
                  <select
                    id="human-path-talent"
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400/30 dark:border-gray-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-slate-600/40"
                    value={selectedPathTalent}
                    onChange={(e) => setSelectedPathTalent(e.target.value)}
                  >
                    <option value="" disabled>
                      Select a talent…
                    </option>
                    {humanOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}

