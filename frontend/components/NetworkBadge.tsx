"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { arcTestnet } from "@/config/wagmi";
import { Loader2 } from "lucide-react";

export function NetworkBadge() {
  const { chainId, isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected) return null;

  const isCorrect = chainId === arcTestnet.id;

  const content = (
    <>
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
            isCorrect ? "bg-emerald-400" : "bg-rose-400"
          }`}
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            isCorrect ? "bg-emerald-400" : "bg-rose-400"
          }`}
        />
      </span>
      {isPending ? "Switching..." : isCorrect ? arcTestnet.name : "Switch network"}
    </>
  );

  if (isCorrect) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return (
    <button
      onClick={() => switchChain({ chainId: arcTestnet.id })}
      disabled={isPending}
      className="flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 backdrop-blur-md transition hover:bg-rose-500/20 disabled:opacity-60"
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      {content}
    </button>
  );
}
