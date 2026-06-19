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
    <div className="relative overflow-hidden rounded-3xl glass-strong p-6 sm:p-8">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Send batch
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Distribute native USDC to multiple addresses in one transaction.
            </p>
          </div>
          <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 sm:block">
            Max {MAX_RECIPIENTS} recipients
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Amount per recipient
            </label>
            <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-white/5 px-3 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30">
              <span className="text-sm text-slate-500">USDC</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.05"
                className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
            {amountPerRecipient === 0n && amount !== "" && amount !== "0" && (
              <p className="mt-2 text-xs text-rose-400">
                Enter a valid amount.
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-300">
                Recipients
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  {parsed.unique.length} / {MAX_RECIPIENTS}
                </span>
                {recipientsRaw && (
                  <button
                    type="button"
                    onClick={clear}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
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
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
              spellCheck={false}
            />
            {parsed.invalid > 0 && (
              <p className="mt-2 text-xs text-rose-400">
                {parsed.invalid} invalid {parsed.invalid === 1 ? "entry" : "entries"} ignored.
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              Duplicate addresses are automatically removed.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Recipients</span>
              <span className="font-medium text-white">{parsed.unique.length}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-400">Amount each</span>
              <span className="font-medium text-white">
                {amountPerRecipient > 0n ? formatEther(amountPerRecipient) : "0"} USDC
              </span>
            </div>
            <div className="mt-3 border-t border-white/10 pt-3 flex items-center justify-between">
              <span className="text-slate-300">Total to send</span>
              <span className="text-lg font-semibold text-white">
                {totalFormatted} USDC
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Your balance</span>
              <span className="font-mono">
                {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : "—"}
              </span>
            </div>
          </div>

          {(simulateError || submissionError) && !isSuccess && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              <div>
                {submissionError || simulateError?.message || "Transaction cannot be simulated."}
              </div>
            </div>
          )}

          {isSuccess && txHash && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <div>
                <p className="font-medium">Transaction confirmed</p>
                <a
                  href={`${arcTestnet.blockExplorers.default.url}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-emerald-300 underline underline-offset-2 transition hover:text-emerald-100"
                >
                  View on explorer
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          )}

          {receiptError && txHash && !isSuccess && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div>
                <p className="font-medium">Transaction is taking too long</p>
                <p className="mt-1 text-xs text-amber-300/80">
                  {receiptError.message}
                </p>
                <a
                  href={`${arcTestnet.blockExplorers.default.url}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-amber-300 underline underline-offset-2 transition hover:text-amber-100"
                >
                  Check status on explorer
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          )}

          {!isSuccess && isBusy && !submissionError && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                {isWriting ? "Waiting for wallet signature..." : "Confirming transaction..."}
              </div>
              {txHash && !isWriting && (
                <div className="mt-2 flex items-center gap-2 font-mono text-xs">
                  <span className="truncate">{txHash}</span>
                  <a
                    href={`${arcTestnet.blockExplorers.default.url}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-indigo-300 underline underline-offset-2 transition hover:text-indigo-100"
                  >
                    View
                  </a>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isBusy || !isValid}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
          >
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isWriting ? "Submitting..." : "Confirming..."}
              </>
            ) : !isConnected ? (
              <>
                <Wallet className="h-4 w-4" />
                Connect wallet to send
              </>
            ) : (
              <>
                <Send className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                Send batch
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
