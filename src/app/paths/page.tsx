// app/paths/page.tsx
"use client";

import Link from "next/link";
import { useCharacterStore } from "@/lib/store/character";

export default function PathsPage() {
  const { path } = useCharacterStore();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Paths</h1>

      <div className="rounded-xl border p-4">
        <p className="text-sm text-gray-600">Selected Path</p>
        <p className="mt-1 text-lg font-semibold">
          {path || "— none selected —"}
        </p>
      </div>

      {!path && (
        <p className="mt-4 text-sm text-gray-600">
          Choose a Path on the{" "}
          <Link href="/basics" className="underline">
            Basics
          </Link>{" "}
          page to see it here.
        </p>
      )}
    </div>
  );
}

