"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { arcTestnet } from "@/config/wagmi";
import { Loader2 } from "lucide-react";

export function NetworkBadge() {
  const { chainId, isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected) return null;

  const isCorrect = chainId === arcTestnet.id;

  const dot = (
    <span
      aria-hidden="true"
      className={`inline-block h-2.5 w-2.5 border border-blu-deep ${
        isCorrect ? "bg-blu motion-safe:animate-blink" : "bg-white"
      }`}
    />
  );

  const label = isPending
    ? "Switching…"
    : isCorrect
    ? arcTestnet.name
    : "Wrong net — switch";

  if (isCorrect) {
    return (
      <span className="bevel-in hidden items-center gap-2 px-2 py-1 font-mono text-[11px] font-bold text-blu-deep sm:flex">
        {dot}
        {label}
      </span>
    );
  }

  return (
    <button
      onClick={() => switchChain({ chainId: arcTestnet.id })}
      disabled={isPending}
      className="btn9 text-[11px]"
    >
      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : dot}
      {label}
    </button>
  );
}
