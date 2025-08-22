"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Sparkles, Wand2 } from "lucide-react";
import {
  useCharacterStore,
  PATH_KEY_TALENT,
  type Ancestry,
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
  const entries = Object.entries(PATH_KEY_TALENT) as [Exclude<Path, "">, PathKeyTalent][];
  return entries.filter(([p]) => p !== currentPath).map(([, t]) => t);
}

// Human additional talent options based on Path + Specialty
function humanAdditionalTalentOptions(
  path: Exclude<Path, "">,
  focus: Exclude<PathFocus, ""> | ""
): readonly string[] {
  // Rule 1: Agent → Investigator
  if (path === "Agent") {
    if (focus === "Investigator") {
      return [
        "Watchful Eye",
        "Get Em Talking",
        ...otherPathKeyTalents("Agent"), // any OTHER path’s Key Talent
      ] as const;
    } else if (focus === "Spy") {
      return [
        "Sure Outcome",
        "Plausible Excuse",
        ...otherPathKeyTalents("Agent"), // any OTHER path’s Key Talent
      ] as const;
    } else if (focus === "Thief") {
      return [
        "Risky Behavior",
        "Cheap Shot",
        ...otherPathKeyTalents("Agent"), // any OTHER path’s Key Talent
      ] as const;
    }
  } else if (path === "Envoy") {
    if (focus === "Diplomat") {
      return [
        "Steadfast Challenge",
        "Collected",
        ...otherPathKeyTalents("Envoy"), // any OTHER path’s Key Talent
      ] as const;
    } else if (focus === "Faithful") {
      return [
        "Customary Garb",
        "Galvanize",
        ...otherPathKeyTalents("Envoy"), // any OTHER path’s Key Talent
      ] as const;
    } else if (focus === "Mentor") {
      return [
        "Sound Advice",
        "Practical Demonstration",
        ...otherPathKeyTalents("Envoy"), // any OTHER path’s Key Talent
      ] as const;
    }
  } else if (path === "Hunter") {
    if (focus === "Archer") {
      return [
        "Tagging Shot",
        "Combat Training",
        ...otherPathKeyTalents("Hunter"), // any OTHER path’s Key Talent
      ] as const;
    } else if (focus === "Assassin") {
      return [
        "Startling Blow",
        "Killing Edge",
        ...otherPathKeyTalents("Hunter"), // any OTHER path’s Key Talent
      ] as const;
    } else if (focus === "Tracker") {
      return [
        "Deadly Trap",
        "Animal Bond",
        ...otherPathKeyTalents("Hunter"), // any OTHER path’s Key Talent
      ] as const;
    }
  } else if (path === "Leader") {
    if (focus === "Champion") {
      return [
        "Combat Coordination",
        "Valiant Intervention",
        ...otherPathKeyTalents("Leader"), // any OTHER path’s Key Talent
      ] as const;
    } else if (focus === "Officer") {
      return [
        "Composed",
        "Through the Fray",
        ...otherPathKeyTalents("Leader"), // any OTHER path’s Key Talent
      ] as const;
    } else if (focus === "Politico") {
      return [
        "Cutthroat Tactics",
        "Tactical Ploy",
        ...otherPathKeyTalents("Leader"), // any OTHER path’s Key Talent
      ] as const;
    }
  }
  // TODO: Add rules for other path/specialty combos here as you define them.
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
      <p className="mb-6 text-sm text-gray-600">
        Your <strong>Key Talent</strong> is determined by your <strong>Path</strong> (Humans & Singers).
        Singers also gain <strong>Change Form</strong>. Humans select one additional Path Talent once a
        <strong> Specialty</strong> is chosen.
      </p>

      {!hasBasics ? (
        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-700">
            Choose your <strong>Ancestry</strong> and <strong>Path</strong> on{" "}
            <Link href="/basics" className="underline">Basics</Link>, then return here.
          </p>
        </div>
      ) : (
        <>
          {/* Key Talent (from Path) */}
          <section className="mb-6 rounded-xl border p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm text-gray-600">Key Talent (from Path)</div>
              <Sparkles className="h-5 w-5 text-gray-500" aria-hidden />
            </div>
            <div className="text-2xl font-semibold">{keyTalent ?? "—"}</div>
            <p className="mt-2 text-xs text-gray-500">
              Path: {path}. Ancestry: {ancestry}.
            </p>
          </section>

          {/* Singer: fixed additional Talent */}
          {isSinger && (
            <section className="mb-6 rounded-xl border p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-gray-600">Additional Talent</div>
                <Wand2 className="h-5 w-5 text-gray-500" aria-hidden />
              </div>
              <div className="text-2xl font-semibold">Change Form</div>
              <p className="mt-2 text-xs text-gray-500">
                Singers always gain <em>Change Form</em> in addition to their Key Talent.
              </p>
            </section>
          )}

          {/* Human: additional talent — unlocked after Specialty */}
          {isHuman && (
            <section className="mb-6 rounded-xl border p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-gray-600">Additional Talent (Human)</div>
                <Wand2 className="h-5 w-5 text-gray-500" aria-hidden />
              </div>

              {!pathFocus ? (
                <p className="text-sm">
                  Choose a <strong>Specialty</strong> on the{" "}
                  <Link href="/paths" className="underline">Paths</Link> page to unlock this choice.
                </p>
              ) : humanOptions.length === 0 ? (
                <>
                  <div className="text-sm">
                    No options defined yet for <strong>{path}</strong> →{" "}
                    <strong>{pathFocus}</strong>.
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Once you provide the options, the selector will enable.
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <label htmlFor="human-path-talent" className="text-sm text-gray-700">
                    Choose one:
                  </label>
                  <select
                    id="human-path-talent"
                    className="rounded-lg border px-3 py-2 text-sm"
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

              {selectedPathTalent && (
                <p className="mt-2 text-xs text-gray-500">
                  Chosen: <em>{selectedPathTalent}</em>
                </p>
              )}
            </section>
          )}
        </>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Link href="/skills" className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
          ← Back to Skills
        </Link>
        <Link
          href="/surges"
          className="ml-auto rounded-lg bg-gray-900 px-3 py-2 text-sm text-white hover:opacity-90"
        >
          Continue to Surges →
        </Link>
      </div>
    </div>
  );
}

