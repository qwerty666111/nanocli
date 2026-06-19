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
      <button onClick={() => disconnect()} className="btn9 group">
        <span className="font-mono normal-case">
          {address?.slice(0, 6)}…{address?.slice(-4)}
        </span>
        <LogOut className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected(), chainId: arcTestnet.id })}
      className="btn9 btn9-primary"
    >
      <Wallet className="h-3.5 w-3.5" />
      Connect
    </button>
  );
}
