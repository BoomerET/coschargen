"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Sparkles, Wand2 } from "lucide-react";
import {
  useCharacterStore,
  PATH_KEY_TALENT,
  type Ancestry,
  type Path,
  type PathKeyTalent,
} from "@/lib/store/character";

// ⬇️ Fill these arrays later with the actual Human path talent choices.
// Right now they're empty; the UI will show a disabled selector until you provide options.
const PATH_TALENT_OPTIONS: Record<Exclude<Path, "">, readonly string[]> = {
  Agent: ["Investigator", "Spy", "Thief"],
  Envoy: ["Diplomat", "Faithful", "Mentor"],
  Hunter: ["Archer", "Assassin", "Tracker"],
  Leader: ["Champion", "Officer", "Politico"],
  Scholar: ["Artifabrian", "Strategist", "Surgeon"],
  Warrior: ["Duelist", "Shardbearer", "Soldier"],
};

function computeKeyTalent(path: Path): PathKeyTalent | null {
  if (!path) return null;
  return PATH_KEY_TALENT[path as Exclude<Path, "">];
}

export default function TalentsPage() {
  const {
    ancestry,
    path,
    selectedPathTalent,
    setSelectedPathTalent,
  } = useCharacterStore();

  const keyTalent = useMemo(
    () => computeKeyTalent(path as Path),
    [path]
  );

  const needsAncestry = !ancestry;
  const needsPath = !!ancestry && !path;

  const isSinger = ancestry === "Singer";
  const isHuman = ancestry === "Human (Roshar)";

  const humanOptions =
    path ? PATH_TALENT_OPTIONS[path as Exclude<Path, "">] : [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold">Talents</h1>
      <p className="mb-6 text-sm text-gray-600">
        Your <strong>Key Talent</strong> comes from your <strong>Path</strong> (for both Humans and Singers).
        <br />
        Singers also gain <strong>Change Form</strong>.
        Humans will <strong>choose one additional Path Talent</strong> (options coming soon).
      </p>

      {(needsAncestry || needsPath) ? (
        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-700">
            {needsAncestry && (
              <>
                Choose your <strong>Ancestry</strong> on{" "}
                <Link href="/basics" className="underline">Basics</Link>.
              </>
            )}
            {!needsAncestry && needsPath && (
              <>
                Choose your <strong>Path</strong> on{" "}
                <Link href="/basics" className="underline">Basics</Link>, then return here.
              </>
            )}
          </p>
        </div>
      ) : (
        <>
          {/* Key Talent (from Path) */}
          <section className="mb-6 rounded-xl border p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm text-gray-600">Key Talent</div>
              <Sparkles className="h-5 w-5 text-gray-500" aria-hidden />
            </div>
            <div className="text-2xl font-semibold">{keyTalent ?? "—"}</div>
          </section>

          {/* Additional Talent — depends on Ancestry */}
          {isSinger && (
            <section className="mb-6 rounded-xl border p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-gray-600">Additional Talent</div>
                <Wand2 className="h-5 w-5 text-gray-500" aria-hidden />
              </div>
              <div className="text-2xl font-semibold">Change Form</div>
              <p className="mt-2 text-xs text-gray-500">
                Singers always gain <em>Change Form</em> as an additional Talent.
              </p>
            </section>
          )}

          {isHuman && (
            <section className="mb-6 rounded-xl border p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-gray-600">Path Specialty</div>
                <Wand2 className="h-5 w-5 text-gray-500" aria-hidden />
              </div>

              {humanOptions.length === 0 ? (
                <>
                  <div className="text-sm">
                    No talent options have been provided yet for <strong>{path}</strong>.
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Once you post the Path-specific talent list, this selector will enable and your choice will be saved.
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
                      Select a Specialty…
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

    </div>
  );
}

