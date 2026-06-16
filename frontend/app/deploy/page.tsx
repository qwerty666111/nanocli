"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useDeployContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { arcTestnet } from "@/config/wagmi";

export default function DeployPage() {
  const { address, isConnected, chainId } = useAccount();
  const [artifact, setArtifact] = useState<{
    abi: unknown;
    bytecode: string;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { deployContract, data: hash, isPending: isDeploying } = useDeployContract();
  const { data: receipt, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    fetch("/api/contract-artifact")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setLoadError(data.error);
        } else {
          setArtifact(data);
        }
      })
      .catch((err) => setLoadError(err.message));
  }, []);

  useEffect(() => {
    if (isSuccess && receipt?.contractAddress && !saved) {
      fetch("/api/deployed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractAddress: receipt.contractAddress,
          network: arcTestnet.name,
          deployedAt: new Date().toISOString(),
        }),
      })
        .then(() => setSaved(true))
        .catch((err) => setLoadError(err.message));
    }
  }, [isSuccess, receipt, saved]);

  const handleDeploy = () => {
    if (!artifact || !address) return;
    setLoadError(null);
    deployContract({
      abi: artifact.abi as any,
      bytecode: artifact.bytecode as `0x${string}`,
      args: [address],
    });
  };

  const onCorrectChain = chainId === arcTestnet.id;

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Deploy NanoCLI</h1>
        <p className="mt-2 text-slate-600">
          Connect your wallet, switch to Arc Testnet, and deploy the BatchPayment
          contract directly from the browser.
        </p>

        <div className="mt-6 flex items-center justify-between">
          <ConnectButton />
          {!onCorrectChain && isConnected && (
            <span className="text-sm text-red-600">
              Switch to Arc Testnet (chainId {arcTestnet.id})
            </span>
          )}
        </div>

        {loadError && (
          <div className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {loadError}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-700">
            <p>
              <strong>Network:</strong> {arcTestnet.name}
            </p>
            <p>
              <strong>RPC:</strong> {arcTestnet.rpcUrls.default.http[0]}
            </p>
            <p>
              <strong>Deployer:</strong> {address ?? "Not connected"}
            </p>
          </div>

          <button
            onClick={handleDeploy}
            disabled={!isConnected || !onCorrectChain || !artifact || isDeploying}
            className="w-full rounded-lg bg-arc-600 px-4 py-2 text-sm font-semibold text-white hover:bg-arc-500 disabled:cursor-not-allowed disabled:bg-slate-300 transition"
          >
            {isDeploying ? "Deploying..." : "Deploy BatchPayment"}
          </button>

          {hash && (
            <div className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
              Transaction: {hash}
            </div>
          )}

          {isSuccess && receipt?.contractAddress && (
            <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              <p>
                <strong>Contract deployed!</strong>
              </p>
              <p>Address: {receipt.contractAddress}</p>
              <p>
                <a
                  href={`${arcTestnet.blockExplorers.default.url}/address/${receipt.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  View on explorer
                </a>
              </p>
              {saved && <p className="mt-1">Saved to deployed.json</p>}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
