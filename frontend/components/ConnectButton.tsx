"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className="rounded-lg bg-arc-700 px-4 py-2 text-sm font-semibold text-white hover:bg-arc-600 transition"
      >
        Disconnect {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="rounded-lg bg-arc-600 px-4 py-2 text-sm font-semibold text-white hover:bg-arc-500 transition"
    >
      Connect Wallet
    </button>
  );
}
