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
    <div className="bevel-out font-mono text-blu-deep">
      {/* mini title bar */}
      <div className="dither-on-blue flex items-center gap-2 px-2 py-1 text-white">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span className="font-mono text-[11px] font-bold tracking-tight">
          SYSTEM\CONTRACT.SYS
        </span>
      </div>

      <div className="space-y-3 p-3">
        <div className="text-[11px] font-bold uppercase">
          Verified on ArcScan
        </div>

        <div className="well break-all p-2 text-[11px]">
          {address || "Loading contract…"}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={copy} disabled={!address} className="btn9 text-[11px]">
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>

          <a
            href={`${arcTestnet.blockExplorers.default.url}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn9 text-[11px]"
          >
            <ExternalLink className="h-3 w-3" />
            Explorer
          </a>
        </div>
      </div>
    </div>
  );
}
