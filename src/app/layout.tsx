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
    <>
    <html lang="en" className="h-full" supresshydrationwarning="true">
      <head />
      <body className="min-h-[100dvh] bg-white text-gray-900 antialiased">
         <div className="flex min-h-[100dvh]">
          <Sidebar />
          <main className="flex-1">
            {/* Add page padding so content doesn’t hug the edges */}
            <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
    </>
  );
}

