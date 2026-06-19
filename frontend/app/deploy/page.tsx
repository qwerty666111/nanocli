"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useDeployContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Header } from "@/components/Header";
import { GradientBackground } from "@/components/GradientBackground";
import { DesktopWindow } from "@/components/DesktopWindow";
import { Taskbar } from "@/components/Taskbar";
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
    <div className="relative min-h-screen text-blu-deep">
      <GradientBackground />
      <Header />

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-10 sm:px-6">
        <DesktopWindow
          title="C:\NANOCLI\DEPLOY.EXE"
          status={[
            `Net: ${arcTestnet.name}`,
            isConnected ? "Wallet OK" : "No wallet",
            "Local Intranet",
          ]}
        >
          <div className="font-mono text-blu-deep">
            <div className="mb-4 flex items-center gap-2 border-b-2 border-dotted border-blu-deep pb-3">
              <span className="grid h-9 w-9 place-items-center bevel-in text-blu">
                <Rocket className="h-4 w-4" />
              </span>
              <div>
                <h1 className="font-pixel text-2xl leading-none">Deploy BatchPayment</h1>
                <p className="text-xs">
                  Deploy a new verified instance from your browser.
                  <span className="cursor-block ml-0.5" aria-hidden="true" />
                </p>
              </div>
            </div>

            <div className="bevel-in p-3 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="uppercase">Network</span>
                <span className="font-bold">{arcTestnet.name}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="uppercase">RPC</span>
                <span className="break-all text-right text-[11px]">
                  {arcTestnet.rpcUrls.default.http[0]}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="uppercase">Deployer</span>
                {address ? (
                  <span className="break-all text-right text-[11px]">{address}</span>
                ) : (
                  <span className="text-blu">Not connected</span>
                )}
              </div>
            </div>

            {!isConnected && (
              <div className="bevel-out mt-4 flex items-center gap-2 p-3 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-blu" />
                Connect your wallet in the header to deploy.
              </div>
            )}

            {isConnected && !onCorrectChain && (
              <div className="bevel-out mt-4 flex items-center gap-2 p-3 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-blu" />
                Switch to {arcTestnet.name} (chainId {arcTestnet.id}) in your wallet.
              </div>
            )}

            {loadError && (
              <div className="bevel-out mt-4 flex items-start gap-2 p-3 text-xs">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blu" />
                <span className="break-words">{loadError}</span>
              </div>
            )}

            <button
              onClick={handleDeploy}
              disabled={!isConnected || !onCorrectChain || !artifact || isDeploying}
              className="btn9 btn9-primary mt-4 w-full py-3 text-base"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deploying…
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Deploy BatchPayment
                </>
              )}
            </button>

            {hash && !isSuccess && (
              <div className="bevel-in mt-3 flex items-center gap-2 p-3 text-[11px]">
                <Loader2 className="h-4 w-4 animate-spin text-blu" />
                <span className="break-all">{hash}</span>
              </div>
            )}

            {isSuccess && receipt?.contractAddress && (
              <div className="bevel-out mt-3 flex items-start gap-2 p-3 text-xs">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blu" />
                <div>
                  <p className="font-bold uppercase">Contract deployed</p>
                  <p className="mt-1 break-all text-[11px]">{receipt.contractAddress}</p>
                  <a
                    href={`${arcTestnet.blockExplorers.default.url}/address/${receipt.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 font-bold text-blu underline decoration-dotted underline-offset-2"
                  >
                    View on explorer
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {saved && (
                    <p className="mt-1.5 text-[11px]">* Saved to deployed.json</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </DesktopWindow>
      </main>

      <Taskbar />
    </div>
  );
}
