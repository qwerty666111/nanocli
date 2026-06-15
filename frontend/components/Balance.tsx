"use client";

import { useAccount, useBalance } from "wagmi";

export function Balance() {
  const { address } = useAccount();
  const { data: balance, isLoading } = useBalance({ address });

  if (!address) return null;

  return (
    <div className="rounded-lg bg-white px-4 py-2 shadow-sm border border-slate-200 text-sm">
      {isLoading ? (
        "Loading balance..."
      ) : (
        <span>
          Balance: <span className="font-semibold">{balance?.formatted}</span>{" "}
          {balance?.symbol}
        </span>
      )}
    </div>
  );
}
