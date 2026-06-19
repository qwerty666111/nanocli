"use client";

import Link from "next/link";
import { ConnectButton } from "./ConnectButton";
import { Balance } from "./Balance";
import { NetworkBadge } from "./NetworkBadge";

/**
 * Top "menu strip" of the desktop — styled like an OS shell header band.
 * Visual only; wallet status/connect controls keep their own hooks.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 bevel-out border-b border-blu-deep">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-1.5">
        <Link href="/" className="group flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="NanoCLI"
            className="pixelated h-7 w-7 border border-blu-deep"
          />
          <span className="font-pixel text-2xl leading-none text-blu-deep">
            NanoCLI
          </span>
          <span className="bevel-in px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-blu-deep">
            v0.1 beta
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <NetworkBadge />
          <Balance />
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
