"use client";

import { useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { batchPaymentAbi } from "@/config/abi";
import { arcTestnet } from "@/config/wagmi";
import { Send, AlertCircle, CheckCircle2, Loader2, X, ArrowUpRight, Wallet } from "lucide-react";

interface BatchTransferProps {
  contractAddress?: string;
}

const MAX_RECIPIENTS = 100;

export function BatchTransfer({ contractAddress }: BatchTransferProps) {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  const [recipientsRaw, setRecipientsRaw] = useState("");
  const [amount, setAmount] = useState("0.05");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const parsed = useMemo(() => {
    const re = /0x[a-fA-F0-9]{40}/g;
    const matches = recipientsRaw.match(re) || [];
    const normalized = matches.map((a) => a.toLowerCase() as `0x${string}`);
    const unique = Array.from(new Set(normalized));
    const invalid = recipientsRaw
      .split(/[\n,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !/^0x[a-fA-F0-9]{40}$/i.test(s)).length;
    return { unique, invalid, rawCount: matches.length };
  }, [recipientsRaw]);

  const amountPerRecipient = useMemo(() => {
    try {
      return parseEther(amount || "0");
    } catch {
      return 0n;
    }
  }, [amount]);

  const total = amountPerRecipient * BigInt(parsed.unique.length);
  const totalFormatted = formatEther(total);
  const balanceValue = balance?.value ?? 0n;

  const isValid =
    isConnected &&
    !!contractAddress &&
    /^0x[a-fA-F0-9]{40}$/i.test(contractAddress) &&
    parsed.unique.length > 0 &&
    parsed.unique.length <= MAX_RECIPIENTS &&
    amountPerRecipient > 0n;

  const { error: simulateError } = useSimulateContract({
    address: (contractAddress as `0x${string}`) || undefined,
    abi: batchPaymentAbi,
    functionName: "batchTransferNative",
    args: [parsed.unique, amountPerRecipient] as const,
    value: total,
    query: { enabled: isValid },
  });

  const { writeContractAsync, isPending: isWriting } = useWriteContract();
  const { isPending: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash: txHash,
    timeout: 60_000,
    query: { enabled: !!txHash },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    setTxHash(undefined);

    if (!isValid) {
      setSubmissionError(
        "Connect your wallet, check the contract address, and enter 1–100 valid recipients with a positive amount."
      );
      return;
    }

    if (total > balanceValue) {
      setSubmissionError(
        `Insufficient balance. You need ${totalFormatted} USDC plus gas.`
      );
      return;
    }

    try {
      const hash = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: batchPaymentAbi,
        functionName: "batchTransferNative",
        args: [parsed.unique, amountPerRecipient] as const,
        value: total,
      });
      if (hash) setTxHash(hash);
    } catch (err: any) {
      setSubmissionError(
        err?.shortMessage || err?.message || "Transaction failed."
      );
    }
  };

  const clear = () => {
    setRecipientsRaw("");
    setSubmissionError(null);
    setTxHash(undefined);
  };

  const isBusy = isWriting || (isConfirming && !!txHash);

  return (
    <div className="font-mono text-blu-deep">
      {/* Program banner */}
      <div className="mb-4 flex items-end justify-between gap-3 border-b-2 border-dotted border-blu-deep pb-3">
        <div>
          <h2 className="font-pixel text-3xl leading-none text-blu-deep">
            BATCH.EXE
          </h2>
          <p className="mt-1 text-xs">
            C:\NANOCLI&gt; distribute native USDC to many addresses in one call
            <span className="cursor-block ml-0.5 align-baseline" aria-hidden="true" />
          </p>
        </div>
        <span className="bevel-in shrink-0 px-2 py-1 text-[10px] font-bold uppercase">
          Max {MAX_RECIPIENTS} rcpt
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Amount */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide">
            &gt; Amount per recipient
          </label>
          <div className="well mt-1.5 flex items-center px-2 focus-within:ring-1 focus-within:ring-blu">
            <span className="px-1 text-xs font-bold text-blu">USDC</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.05"
              className="w-full bg-transparent px-2 py-2 font-mono text-sm text-blu-deep placeholder:text-blu/40 focus:outline-none"
            />
          </div>
          {amountPerRecipient === 0n && amount !== "" && amount !== "0" && (
            <p className="mt-1.5 text-xs font-bold text-blu">! Enter a valid amount.</p>
          )}
        </div>

        {/* Recipients */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wide">
              &gt; Recipients
            </label>
            <div className="flex items-center gap-3">
              <span className="bevel-in px-2 py-0.5 text-[10px] font-bold tabular-nums">
                {parsed.unique.length} / {MAX_RECIPIENTS}
              </span>
              {recipientsRaw && (
                <button
                  type="button"
                  onClick={clear}
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase underline decoration-dotted underline-offset-2 hover:text-blu"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>
          </div>
          <textarea
            value={recipientsRaw}
            onChange={(e) => setRecipientsRaw(e.target.value)}
            rows={8}
            placeholder="0xAbc...123&#10;0xDef...456&#10;Paste one address per line, or separate with commas/spaces."
            className="well mt-1.5 w-full px-3 py-2 font-mono text-sm text-blu-deep placeholder:text-blu/40 focus:outline-none focus:ring-1 focus:ring-blu"
            spellCheck={false}
          />
          {parsed.invalid > 0 && (
            <p className="mt-1.5 text-xs font-bold text-blu">
              ! {parsed.invalid} invalid {parsed.invalid === 1 ? "entry" : "entries"} ignored.
            </p>
          )}
          <p className="mt-1.5 text-[11px] text-blu">
            * Duplicate addresses are automatically removed.
          </p>
        </div>

        {/* Readout panel */}
        <div className="bevel-in p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="uppercase">Recipients</span>
            <span className="font-bold tabular-nums">{parsed.unique.length}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="uppercase">Amount each</span>
            <span className="font-bold tabular-nums">
              {amountPerRecipient > 0n ? formatEther(amountPerRecipient) : "0"} USDC
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-dotted border-blu-deep pt-2">
            <span className="font-bold uppercase">Total to send</span>
            <span className="font-pixel text-xl leading-none text-blu-deep">
              {totalFormatted} USDC
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="uppercase">Your balance</span>
            <span className="tabular-nums">
              {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : "—"}
            </span>
          </div>
        </div>

        {/* Error dialog */}
        {(simulateError || submissionError) && !isSuccess && (
          <div className="bevel-out flex items-start gap-2 p-3 text-xs">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blu" />
            <div className="break-words">
              {submissionError || simulateError?.message || "Transaction cannot be simulated."}
            </div>
          </div>
        )}

        {/* Success dialog */}
        {isSuccess && txHash && (
          <div className="bevel-out flex items-start gap-2 p-3 text-xs">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blu" />
            <div>
              <p className="font-bold uppercase">Transaction confirmed</p>
              <a
                href={`${arcTestnet.blockExplorers.default.url}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 font-bold text-blu underline decoration-dotted underline-offset-2"
              >
                View on explorer
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}

        {/* Timeout warning */}
        {receiptError && txHash && !isSuccess && (
          <div className="bevel-out flex items-start gap-2 p-3 text-xs">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blu" />
            <div>
              <p className="font-bold uppercase">Transaction is taking too long</p>
              <p className="mt-1 break-words text-blu">{receiptError.message}</p>
              <a
                href={`${arcTestnet.blockExplorers.default.url}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 font-bold text-blu underline decoration-dotted underline-offset-2"
              >
                Check status on explorer
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}

        {/* Busy / progress */}
        {!isSuccess && isBusy && !submissionError && (
          <div className="bevel-in p-3 text-xs">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blu" />
              {isWriting ? "Waiting for wallet signature…" : "Confirming transaction…"}
            </div>
            {txHash && !isWriting && (
              <div className="mt-1.5 flex items-center gap-2 break-all text-[11px]">
                <span className="truncate">{txHash}</span>
                <a
                  href={`${arcTestnet.blockExplorers.default.url}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 font-bold text-blu underline decoration-dotted underline-offset-2"
                >
                  View
                </a>
              </div>
            )}
          </div>
        )}

        {/* RUN BATCH */}
        <button
          type="submit"
          disabled={isBusy || !isValid}
          className="btn9 btn9-primary group w-full py-3 text-base"
        >
          {isBusy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isWriting ? "Submitting…" : "Confirming…"}
            </>
          ) : !isConnected ? (
            <>
              <Wallet className="h-4 w-4" />
              Connect wallet to send batch
            </>
          ) : (
            <>
              <Send className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              Run batch — Send batch
            </>
          )}
        </button>
      </form>
    </div>
  );
}
