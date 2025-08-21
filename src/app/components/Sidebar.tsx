// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ComponentType } from "react";
import {
  BookOpen, // Basics
  BarChart3, // Stats
  Map, // Paths
  Feather, // Skills
  ListChecks,
  Brain, // Expertises
  Wand2, // Talents
  Zap, // Surges
  Sparkles, // Radiant Powers
  Save, // Export
} from "lucide-react";

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

const NAV_ITEMS: { label: string; href: string; icon: IconType }[] = [
  { label: "Basics", href: "/basics", icon: BookOpen },
  { label: "Stats", href: "/stats", icon: BarChart3 },
  { label: "Paths", href: "/paths", icon: Map },
  { label: "Skills", href: "/skills", icon: ListChecks },
  { label: "Expertises", href: "/expertises", icon: Brain },
  { label: "Talents", href: "/talents", icon: Wand2 },
  { label: "Surges", href: "/surges", icon: Zap },
  { label: "Radiant Powers", href: "/radiant-powers", icon: Sparkles },
  { label: "Export to XML", href: "/export", icon: Save },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
          <span className="font-semibold">Cosmere Character Generator</span>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
            className="inline-flex items-center rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
        {open && (
          <nav
            className="border-t bg-white px-2 py-2"
            aria-label="Mobile Navigation"
          >
            <ul className="grid gap-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={[
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                        active
                          ? "bg-gray-900 text-white"
                          : "text-gray-700 hover:bg-gray-100",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:border-r lg:bg-white">
        <div className="sticky top-0 h-[100dvh] overflow-y-auto px-4 py-6">
          <div className="mb-6 px-1 text-sm font-semibold tracking-wide text-gray-800">
            Cosmere Character Generator
          </div>
          <nav aria-label="Sidebar Navigation">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-gray-900 text-white"
                          : "text-gray-700 hover:bg-gray-100",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
