"use client";

import { useState } from "react";
import { arcTestnet } from "@/config/wagmi";
import { Copy, Check, ExternalLink, ShieldCheck } from "lucide-react";

interface ContractCardProps {
  address?: string;
}

export function ContractCard({ address }: ContractCardProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl glass-strong p-6">
      <div className="absolute right-0 top-0 h-32 w-32 bg-gradient-to-bl from-indigo-500/15 to-transparent" />
      <div className="relative">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          Verified on ArcScan
        </div>

        <div className="mt-3 font-mono text-sm text-white break-all">
          {address || "Loading contract..."}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={copy}
            disabled={!address}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 disabled:opacity-40"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>

          <a
            href={`${arcTestnet.blockExplorers.default.url}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Explorer
          </a>
        </div>
      </div>
    </div>
  );
}
