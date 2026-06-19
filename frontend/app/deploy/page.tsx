"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useDeployContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Header } from "@/components/Header";
import { GradientBackground } from "@/components/GradientBackground";
import { arcTestnet } from "@/config/wagmi";
import { Rocket, AlertCircle, CheckCircle2, Loader2, ExternalLink } from "lucide-react";

export default function DeployPage() {
  const { address, isConnected, chainId } = useAccount();
  const [artifact, setArtifact] = useState<{
    abi: unknown;
    bytecode: string;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { deployContract, data: hash, isPending: isDeploying } =
    useDeployContract();
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
    <div className="min-h-screen text-slate-100">
      <GradientBackground />
      <Header />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-6 sm:p-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  Deploy BatchPayment
                </h1>
                <p className="text-sm text-slate-400">
                  Deploy a new verified instance from your browser.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Network</span>
                <span className="font-medium">{arcTestnet.name}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">RPC</span>
                <span className="font-mono">{arcTestnet.rpcUrls.default.http[0]}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Deployer</span>
                {address ? (
                  <span className="font-mono">{address}</span>
                ) : (
                  <span className="text-slate-500">Not connected</span>
                )}
              </div>
            </div>

            {!isConnected && (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-indigo-400" />
                Connect your wallet in the header to deploy.
              </div>
            )}

            {isConnected && !onCorrectChain && (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                Switch to {arcTestnet.name} (chainId {arcTestnet.id}) in your wallet.
              </div>
            )}

            {loadError && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                {loadError}
              </div>
            )}

            <button
              onClick={handleDeploy}
              disabled={!isConnected || !onCorrectChain || !artifact || isDeploying}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Deploy BatchPayment
                </>
              )}
            </button>

            {hash && !isSuccess && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                <span className="font-mono">{hash}</span>
              </div>
            )}

            {isSuccess && receipt?.contractAddress && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <div>
                  <p className="font-medium">Contract deployed</p>
                  <p className="mt-1 font-mono">{receipt.contractAddress}</p>
                  <a
                    href={`${arcTestnet.blockExplorers.default.url}/address/${receipt.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-emerald-300 underline underline-offset-2 transition hover:text-emerald-100"
                  >
                    View on explorer
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  {saved && (
                    <p className="mt-2 text-xs text-emerald-300/80">
                      Saved to deployed.json
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
