"use client";

import { useAccount, useBalance } from "wagmi";

export function Balance() {
  const { address } = useAccount();
  const { data: balance, isLoading } = useBalance({ address });

  if (!address) return null;

  const formatted =
    !isLoading && balance
      ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
      : "...";

  return (
    <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md sm:flex">
      <span className="text-slate-400">Balance</span>
      <span className="font-mono text-slate-100">{formatted}</span>
    </div>
  );
}
