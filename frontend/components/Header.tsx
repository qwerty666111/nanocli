"use client";

import Link from "next/link";
import { ConnectButton } from "./ConnectButton";
import { Balance } from "./Balance";
import { NetworkBadge } from "./NetworkBadge";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="NanoCLI"
            className="h-10 w-10 rounded-xl shadow-lg shadow-indigo-500/20 transition group-hover:shadow-indigo-500/40"
          />
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-white">
              NanoCLI
            </span>
            <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/20">
              BETA
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <NetworkBadge />
          <Balance />
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
