// src/app/expertises/page.tsx
"use client";

import { useMemo } from "react";
import {
  useCharacterStore,
  type AnyExpertise,
  type CulturalExpertise,
  type ArmorExpertise,
  type UtilityExpertise,
  type WeaponExpertise,
} from "@/lib/store/character";
import Link from "next/link";

// ── Data lists ──
const ARMOR: readonly ArmorExpertise[] = [
  "Breastplate","Chain Armor","Half Plate","Leather","Shardplate",
] as const;

const WEAPONS: readonly WeaponExpertise[] = [
  "Axe","Crossbow","Grandbow","Greatsword","Half-Shard","Hammer","Javelin","Knife",
  "Longbow","Longspear","Longsword","Mace","Poleaxe","Rapier","Shardblade","Shield",
  "Shortbow","Shortspear","Sidesword","Sling","Staff","Unarmed Attacks","Warhammer",
] as const;

const CULTURAL: readonly CulturalExpertise[] = [
  "Alethi","Azish","Herdazian","High Society","Iriali","Kharbranthian","Listener",
  "Military Life","Natan","Reshi","Shin","Thaylen","Underworld","Unkalaki","Veden","Wayfarer",
] as const;

const UTILITY: readonly UtilityExpertise[] = [
  "Animal Care","Armor Crafting","Culinary Arts","Engineering","Equipment","History",
  "Literature","Military","Religion","Riding Horses","Stormwardens","Visual Arts","Weapon Crafting",
] as const;

const ALL: readonly AnyExpertise[] = [...CULTURAL, ...ARMOR, ...UTILITY, ...WEAPONS] as const;

export default function ExpertisesPage() {
  const {
    stats,
    culturalExpertises,
    generalExpertises,
    toggleCultural,
    toggleGeneral,
    clearExpertises,
  } = useCharacterStore();

  const intCap = stats.INT ?? 0;
  const culturalCount = culturalExpertises.length;
  const generalCount = generalExpertises.length;

  const isCulturalChecked = (e: CulturalExpertise) => culturalExpertises.includes(e);
  const isGeneralChecked = (e: AnyExpertise) => generalExpertises.includes(e);

  const culturalFull = culturalCount >= 2;
  const generalFull = generalCount >= intCap;

  // For “Additional Expertises”, we gray out items already chosen as Cultural
  const isBlockedByCultural = (e: AnyExpertise) => (culturalExpertises as readonly AnyExpertise[]).includes(e);

  // Helpful booleans
  const needsMoreCultural = culturalCount < 2;
  const needsMoreGeneral = generalCount < intCap;

  const statusNote = useMemo(() => {
    const parts: string[] = [];
    if (needsMoreCultural) parts.push(`Choose ${2 - culturalCount} more Cultural`);
    if (intCap > 0 && needsMoreGeneral) parts.push(`Choose ${intCap - generalCount} more Additional`);
    if (intCap === 0) parts.push("No Additional expertises required (INT 0)");
    return parts.join(" · ");
  }, [culturalCount, generalCount, intCap, needsMoreCultural, needsMoreGeneral]);
  
  const totalAllowed = 2 + intCap;
  const totalSelected = culturalExpertises.length + generalExpertises.length;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-2xl font-bold">Expertises</h1>
      <p className="mb-6 text-sm text-gray-600">
        Select <strong>two</strong> Cultural expertises. Then select <strong>{intCap}</strong> additional expertises (any category).
      </p>

      {/* Status pill */}
      <div className="mb-4 inline-flex items-center rounded-full border bg-gray-50 px-3 py-1 text-sm">
        <span className="mr-3">Progress</span>
        <span className="rounded-md border bg-white px-2 py-0.5 text-xs">
          Cultural {culturalCount}/2
        </span>
        <span className="ml-2 rounded-md border bg-white px-2 py-0.5 text-xs">
          Additional {generalCount}/{intCap}
        </span>
      </div>

      {/* Cultural (exactly 2) */}
      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">Cultural (choose 2)</h2>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {CULTURAL.map((e) => {
            const checked = isCulturalChecked(e);
            const disabled = !checked && culturalFull; // block new picks at cap
            return (
              <label
                key={e}
                className={[
                  "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2",
                  disabled ? "opacity-50" : "hover:bg-gray-50",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCultural(e)}
                  disabled={disabled}
                  className="h-4 w-4"
                  aria-label={e}
                />
                <span>{e}</span>
              </label>
            );
          })}
        </div>
      </section>

      {/* Additional expertises (exactly INT) */}
      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">Additional Expertises (choose {intCap})</h2>

        {/* Armor */}
        <Category
          title="Armor"
          items={ARMOR}
          isChecked={isGeneralChecked}
          isDisabled={(e) => (!isGeneralChecked(e) && generalFull) || isBlockedByCultural(e)}
          onToggle={(e) => toggleGeneral(e)}
        />
        {/* Utility */}
        <Category
          title="Utility"
          items={UTILITY}
          isChecked={isGeneralChecked}
          isDisabled={(e) => (!isGeneralChecked(e) && generalFull) || isBlockedByCultural(e)}
          onToggle={(e) => toggleGeneral(e)}
        />
        {/* Cultural (extra picks allowed here too, but not the same as your 2) */}
        <Category
          title="Cultural"
          items={CULTURAL}
          isChecked={isGeneralChecked}
          isDisabled={(e) => (!isGeneralChecked(e) && generalFull) || isBlockedByCultural(e)}
          onToggle={(e) => toggleGeneral(e)}
        />
        {/* Weapon */}
        <Category
          title="Weapon"
          items={WEAPONS}
          isChecked={isGeneralChecked}
          isDisabled={(e) => (!isGeneralChecked(e) && generalFull) || isBlockedByCultural(e)}
          onToggle={(e) => toggleGeneral(e)}
        />
      </section>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={clearExpertises}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Clear selections
        </button>
        <span className="text-xs text-gray-500">
          Cultural (2 required). Additional ({intCap} required). Selections save automatically.
        </span>
      </div>
    </div>
  );
}

// Small helper component for category grids
function Category<T extends AnyExpertise>(props: {
  title: string;
  items: readonly T[];
  isChecked: (e: AnyExpertise) => boolean;
  isDisabled: (e: AnyExpertise) => boolean;
  onToggle: (e: AnyExpertise) => void;
}) {
  const { title, items, isChecked, isDisabled, onToggle } = props;
  return (
    <div className="mb-5">
      <h3 className="mb-2 text-sm font-medium text-gray-800">{title}</h3>
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {items.map((e) => {
          const checked = isChecked(e);
          const disabled = isDisabled(e);
          return (
            <label
              key={e as string}
              className={[
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2",
                disabled && !checked ? "opacity-50" : "hover:bg-gray-50",
              ].join(" ")}
              aria-disabled={disabled && !checked}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(e)}
                disabled={disabled && !checked}
                className="h-4 w-4"
                aria-label={e as string}
              />
              <span>{e as string}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

