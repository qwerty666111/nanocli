"use client";

import Link from "next/link";

interface DeskIcon {
  glyph: string;
  label: string;
  href?: string;
}

const ICONS: DeskIcon[] = [
  { glyph: "▤", label: "Batch.exe", href: "/" },
  { glyph: "⛁", label: "Contract" },
  { glyph: "⚙", label: "Deploy", href: "/deploy" },
  { glyph: "?", label: "ReadMe" },
];

/** Static top-left desktop shortcut icons (decorative + a couple real links). */
export function DesktopIcons() {
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-20 hidden flex-col gap-4 md:flex">
      {ICONS.map((ic) => {
        const inner = (
          <>
            <span
              aria-hidden="true"
              className="grid h-10 w-10 place-items-center bevel-out text-lg text-blu-deep"
            >
              {ic.glyph}
            </span>
            <span className="rounded-[1px] bg-blu/0 px-1 text-center font-mono text-[10px] font-bold text-white drop-shadow-[1px_1px_0_var(--blu-deep)]">
              {ic.label}
            </span>
          </>
        );
        const cls =
          "pointer-events-auto flex w-16 flex-col items-center gap-1 focus:outline-none";
        return ic.href ? (
          <Link key={ic.label} href={ic.href} className={cls}>
            {inner}
          </Link>
        ) : (
          <div key={ic.label} className={cls}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
