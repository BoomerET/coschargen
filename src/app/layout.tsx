// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/app/components/Sidebar";

export const metadata: Metadata = {
  title: "Cosmere Character Generator",
  description: "Build player characters with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head />
      <body className="min-h-dvh bg-white text-gray-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <div className="flex min-h-dvh">
          {/* Fixed-width, always-visible sidebar */}
          <aside className="w-64 shrink-0 border-r border-gray-200 bg-white/80 dark:border-gray-700 dark:bg-slate-900/60">
            <Sidebar />
          </aside>

          <main className="flex-1">
            <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}

