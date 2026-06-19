"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { GradientBackground } from "@/components/GradientBackground";
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
    <div className="min-h-screen text-slate-100">
      <GradientBackground />
      <Header />

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Batch payments on{" "}
              <span className="text-gradient">Arc Testnet</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
              Send USDC to up to 100 recipients in a single transaction. Verified
              contract, wallet-only, no private keys ever touch the server.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12"
        >
          <AgentBanner />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 grid gap-6 lg:grid-cols-3"
        >
          <div className="lg:col-span-2">
            <BatchTransfer contractAddress={contractAddress} />
          </div>

          <div className="space-y-6">
            <ContractCard address={contractAddress} />
            <Features />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
