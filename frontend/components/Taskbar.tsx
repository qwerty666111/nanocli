"use client";

import { useEffect, useState } from "react";

/** Bottom desktop taskbar: START button, running task, and a live clock. */
export function Taskbar() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const clock = now
    ? now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bevel-out border-t border-blu-deep">
      <div className="flex items-center gap-2 px-1.5 py-1">
        {/* START */}
        <button
          type="button"
          className="btn9 px-3 py-1 text-sm"
          aria-label="Start menu"
        >
          {/* tiny pixel flag mark */}
          <span aria-hidden="true" className="grid grid-cols-2 gap-px">
            <span className="h-2 w-2 bg-blu" />
            <span className="h-2 w-2 bg-blu" />
            <span className="h-2 w-2 bg-blu" />
            <span className="h-2 w-2 bg-blu" />
          </span>
          Start
        </button>

        {/* Running task button (pressed in = active window) */}
        <span className="bevel-in hidden items-center gap-2 px-3 py-1 font-mono text-xs font-bold text-blu-deep sm:flex">
          <span aria-hidden="true">▣</span>
          NanoCLI — BATCH.EXE
        </span>

        <span className="flex-1" />

        {/* Tray + live clock */}
        <span className="bevel-in flex items-center gap-2 px-3 py-1 font-mono text-xs text-blu-deep">
          <span aria-hidden="true" className="hidden sm:inline">
            ▤ ▥
          </span>
          <span className="tabular-nums" suppressHydrationWarning>
            {clock}
          </span>
        </span>
      </div>
    </div>
  );
}
