"use client";

import { useAccount, useBalance } from "wagmi";

export function Balance() {
  const { address } = useAccount();
  const { data: balance, isLoading } = useBalance({ address });

  if (!address) return null;

  const formatted =
    !isLoading && balance
      ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
      : "…";

  return (
    <span className="bevel-in hidden items-center gap-2 px-2 py-1 font-mono text-[11px] text-blu-deep sm:flex">
      <span className="font-bold uppercase">Bal</span>
      <span className="tabular-nums">{formatted}</span>
    </span>
  );
}
