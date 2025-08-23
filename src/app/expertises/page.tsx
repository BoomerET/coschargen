// src/app/expertises/page.tsx
"use client";

import {
  useCharacterStore,
  type ArmorExpertise,
  type UtilityExpertise,
  type WeaponExpertise,
} from "@/lib/store/character";

import type {
  AnyExpertise,
  CulturalExpertise,
} from "@/lib/store/character";

function isCultural(e: AnyExpertise): e is CulturalExpertise {
  return CULTURAL_SET.has(e as CulturalExpertise);
}

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
const CULTURAL_SET: ReadonlySet<CulturalExpertise> = new Set(CULTURAL);

const UTILITY: readonly UtilityExpertise[] = [
  "Animal Care","Armor Crafting","Culinary Arts","Engineering","Equipment","History",
  "Literature","Military","Religion","Riding Horses","Stormwardens","Visual Arts","Weapon Crafting",
] as const;

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

  const totalAllowed = 2 + intCap;
  const totalSelected = culturalExpertises.length + generalExpertises.length;
  const needTwoCulturalFirst = culturalExpertises.length < 2;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expertise</h1>
        <button
          type="button"
          onClick={clearExpertises}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-slate-800"
        >
          Clear selections
        </button>
      </div>

      {/* Cultural (exactly 2) */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-gray-700 dark:bg-slate-900/60">
        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
          Cultural <span className="text-sm font-normal text-gray-600 dark:text-gray-400">(choose 2)</span>
        </h2>

        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {CULTURAL.map((e) => {
            const checked = culturalExpertises.includes(e);
            // Only disable when we’ve hit the overall cap and this item isn’t already checked
            const disabled = !checked && totalSelected >= totalAllowed;

            return (
              <label
                key={e}
                className={[
                  "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2",
                  "border-gray-200 bg-white/80 dark:border-gray-700 dark:bg-slate-900/60",
                  disabled && !checked ? "opacity-50" : "hover:bg-gray-50 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCultural(e)}
                  disabled={disabled}
                  className="h-4 w-4 accent-indigo-600 dark:accent-indigo-400"
                  aria-label={e}
                />
                <span className="text-gray-800 dark:text-gray-200">{e}</span>
              </label>
            );
          })}
        </div>
      </section>

      {/* Additional expertises (exactly INT) */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-gray-700 dark:bg-slate-900/60">
        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
          Additional Expertises{" "}
          <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
            (choose {intCap})
          </span>
        </h2>

        {/* Armor */}
        <Category
          title="Armor"
          items={ARMOR}
          isChecked={(e) => generalExpertises.includes(e)}
          isDisabled={(item) =>
            (!generalExpertises.includes(item) &&
              (needTwoCulturalFirst || totalSelected >= totalAllowed)) ||
            (isCultural(item) && culturalExpertises.includes(item))
          }
          onToggle={(e) => toggleGeneral(e)}
        />

        {/* Utility */}
        <Category
          title="Utility"
          items={UTILITY}
          isChecked={(e) => generalExpertises.includes(e)}
          isDisabled={(item) =>
            (!generalExpertises.includes(item) &&
              (needTwoCulturalFirst || totalSelected >= totalAllowed)) ||
            (isCultural(item) && culturalExpertises.includes(item))
          }
          onToggle={(e) => toggleGeneral(e)}
        />

        {/* Weapon */}
        <Category
          title="Weapon"
          items={WEAPONS}
          isChecked={(e) => generalExpertises.includes(e)}
          isDisabled={(item) =>
            (!generalExpertises.includes(item) &&
              (needTwoCulturalFirst || totalSelected >= totalAllowed)) ||
            (isCultural(item) && culturalExpertises.includes(item))
          }
          onToggle={(e) => toggleGeneral(e)}
        />
      </section>
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
      <h3 className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
        {title}
      </h3>
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {items.map((e) => {
          const checked = isChecked(e);
          const disabled = isDisabled(e);
          return (
            <label
              key={e as string}
              className={[
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2",
                "border-gray-200 bg-white/80 dark:border-gray-700 dark:bg-slate-900/60",
                disabled && !checked ? "opacity-50" : "hover:bg-gray-50 dark:hover:bg-slate-800",
              ].join(" ")}
              aria-disabled={disabled && !checked}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(e)}
                disabled={disabled && !checked}
                className="h-4 w-4 accent-indigo-600 dark:accent-indigo-400"
                aria-label={e as string}
              />
              <span className="text-gray-800 dark:text-gray-200">{e as string}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

