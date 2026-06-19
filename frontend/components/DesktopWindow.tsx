"use client";

import { useState } from "react";

interface DesktopWindowProps {
  /** Path shown in the title bar, e.g. C:\NANOCLI\BATCH.EXE */
  title: string;
  /** Right-side status bar segments, e.g. ["Obj: 4", "63.2MB free", "Local Intranet"] */
  status?: string[];
  children: React.ReactNode;
  className?: string;
}

const MENU = ["File", "Edit", "View", "Help"];

/**
 * A faux late-90s desktop window: title bar with min/max/close glyphs,
 * a menu bar, a beveled content well, and a status bar.
 * Purely presentational chrome — wraps real app content as children.
 */
export function DesktopWindow({
  title,
  status = ["Obj: 4", "63.2MB free", "Local Intranet"],
  children,
  className = "",
}: DesktopWindowProps) {
  // "focused" toggles the active-window highlight on the title bar.
  const [focused, setFocused] = useState(true);

  return (
    <section
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className={`bevel-out ${className}`}
    >
      {/* ---- Title bar ---- */}
      <div
        className={`flex select-none items-center justify-between px-1.5 py-1 transition-colors ${
          focused ? "dither-on-blue text-white" : "bg-white text-blu-deep"
        }`}
        style={
          focused
            ? undefined
            : { boxShadow: "inset 0 0 0 1px var(--blu-deep)" }
        }
      >
        <div className="flex min-w-0 items-center gap-2">
          {/* tiny window icon */}
          <span
            aria-hidden="true"
            className="grid h-4 w-4 shrink-0 place-items-center border border-current text-[10px] font-bold leading-none"
          >
            N
          </span>
          <span className="truncate font-mono text-xs font-bold tracking-tight">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {["–", "□", "✕"].map((g, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="grid h-4 w-4 place-items-center bevel-out text-[9px] font-bold leading-none text-blu-deep"
            >
              {g}
            </span>
          ))}
        </div>
      </div>

      {/* ---- Menu bar ---- */}
      <div className="flex items-center gap-3 border-b border-blu-deep bg-white px-2 py-0.5">
        {MENU.map((m) => (
          <span
            key={m}
            className="font-mono text-[11px] text-blu-deep"
          >
            <span className="underline decoration-blu-deep underline-offset-2">
              {m[0]}
            </span>
            {m.slice(1)}
          </span>
        ))}
      </div>

      {/* ---- Content well ---- */}
      <div className="dither-25 p-2 sm:p-3">
        <div className="well p-3 sm:p-5">{children}</div>
      </div>

      {/* ---- Status bar ---- */}
      <div className="flex items-stretch gap-1 border-t border-blu-deep bg-white px-1 py-1">
        {status.map((s, i) => (
          <span
            key={i}
            className={`bevel-in px-2 py-0.5 font-mono text-[10px] text-blu-deep ${
              i === 0 ? "flex-1" : ""
            }`}
          >
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}
