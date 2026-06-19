"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { arcTestnet } from "@/config/wagmi";
import { Wallet, LogOut } from "lucide-react";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
      >
        <span className="font-mono text-slate-300">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <LogOut className="h-4 w-4 text-slate-400 transition group-hover:text-white" />
      </button>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected(), chainId: arcTestnet.id })}
      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-[1.02] hover:shadow-indigo-500/40 active:scale-[0.98]"
    >
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </button>
  );
}
