"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { GradientBackground } from "@/components/GradientBackground";
import { DesktopIcons } from "@/components/DesktopIcons";
import { DesktopWindow } from "@/components/DesktopWindow";
import { Taskbar } from "@/components/Taskbar";
import { ContractCard } from "@/components/ContractCard";
import { BatchTransfer } from "@/components/BatchTransfer";
import { Features } from "@/components/Features";
import { AgentBanner } from "@/components/AgentBanner";

export default function Home() {
  const [contractAddress, setContractAddress] = useState<string>("");

  useEffect(() => {
    fetch("/api/deployed")
      .then((res) => res.json())
      .then((data) => setContractAddress(data.contractAddress || ""))
      .catch(() => setContractAddress(""));
  }, []);

  return (
    <div className="relative min-h-screen text-blu-deep">
      <GradientBackground />
      <DesktopIcons />
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6">
        {/* Hero headline — kept as a desktop "welcome" plate */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-pixel text-4xl leading-none text-white drop-shadow-[2px_2px_0_var(--blu-deep)] sm:text-6xl">
              Batch payments on{" "}
              <span className="text-white underline decoration-white/70 decoration-4 underline-offset-4">
                Arc Testnet
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl bg-white/85 px-3 py-1 font-mono text-xs text-blu-deep sm:text-sm">
              Send USDC to up to 100 recipients in a single transaction. Verified
              contract, wallet-only, no private keys ever touch the server.
            </p>
          </motion.div>
        </div>

        {/* Agent ticker */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          <AgentBanner />
        </motion.div>

        {/* The application window */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 grid items-start gap-5 lg:grid-cols-3"
        >
          <div className="lg:col-span-2">
            <DesktopWindow
              title="C:\NANOCLI\BATCH.EXE"
              status={[
                `Obj: ${contractAddress ? 1 : 0}`,
                "63.2MB free",
                "Local Intranet",
              ]}
            >
              <BatchTransfer contractAddress={contractAddress} />
            </DesktopWindow>
          </div>

          <div className="space-y-5">
            <ContractCard address={contractAddress} />
            <Features />
          </div>
        </motion.div>
      </main>

      <Taskbar />
    </div>
  );
}
