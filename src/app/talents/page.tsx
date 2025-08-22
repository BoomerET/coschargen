"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useCharacterStore } from "@/lib/store/character";

// Keep these types in sync with your store exports
type Ancestry = "" | "Human (Roshar)" | "Singer";
type Path =
  | ""
  | "Agent"
  | "Envoy"
  | "Hunter"
  | "Leader"
  | "Scholar"
  | "Warrior";

type KeyTalent =
  | "Opportunist"
  | "Rousing Presence"
  | "Seek Quarry"
  | "Decisive Command"
  | "Erudition"
  | "Vigilant Stance"
  | "Change Form";

const KEY_TALENT_BY_PATH: Record<Exclude<Path, "">, Exclude<KeyTalent, "Change Form">> = {
  Agent: "Opportunist",
  Envoy: "Rousing Presence",
  Hunter: "Seek Quarry",
  Leader: "Decisive Command",
  Scholar: "Erudition",
  Warrior: "Vigilant Stance",
};

function computeKeyTalent(ancestry: Ancestry, path: Path): KeyTalent | null {
  //if (ancestry === "Singer") return "Change Form";
  //if (ancestry === "Human (Roshar)") {
  if (!path) return null;
    return KEY_TALENT_BY_PATH[path];
  //}
  //return null;
}

export default function TalentsPage() {
  const { ancestry, path } = useCharacterStore();

  const keyTalent = useMemo(
    () => computeKeyTalent(ancestry as Ancestry, path as Path),
    [ancestry, path]
  );

  // Guidance when prerequisites are missing
  const needsAncestry = !ancestry;
  const needsPath = ancestry === "Human (Roshar)" && !path;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold">Talents</h1>

      {(needsAncestry || needsPath) ? (
        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-700">
            {needsAncestry && (
              <>
                Choose your <strong>Ancestry</strong> on the{" "}
                <Link href="/basics" className="underline">Basics</Link> page.
              </>
            )}
            {!needsAncestry && needsPath && (
              <>
                Choose your <strong>Path</strong> on the{" "}
                <Link href="/basics" className="underline">Basics</Link> page,
                then return here.
              </>
            )}
          </p>
        </div>
      ) : (
        <section>
          <div className="rounded-xl border p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm text-gray-600">Key Talent</div>
              <Sparkles className="h-5 w-5 text-gray-500" aria-hidden />
            </div>

            <div className="text-2xl font-semibold">
              {keyTalent ?? "—"}
            </div>

          </div>

        </section>
      )}

    </div>
  );
}

