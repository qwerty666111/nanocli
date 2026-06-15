"use client";

import { useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { batchPaymentAbi } from "@/config/abi";
import { arcTestnet } from "@/config/wagmi";

export function BatchForm() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  const [contractAddress, setContractAddress] = useState("");
  const [recipientsRaw, setRecipientsRaw] = useState("");
  const [amount, setAmount] = useState("0.05");
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const recipientList = useMemo(() => {
    return recipientsRaw
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => /^0x[a-fA-F0-9]{40}$/.test(s)) as `0x${string}`[];
  }, [recipientsRaw]);

  const amountPerRecipient = useMemo(() => {
    try {
      return parseEther(amount || "0");
    } catch {
      return 0n;
    }
  }, [amount]);

  const total = amountPerRecipient * BigInt(recipientList.length);
  const isValid = !!(
    isConnected &&
    contractAddress &&
    /^0x[a-fA-F0-9]{40}$/.test(contractAddress) &&
    recipientList.length > 0 &&
    recipientList.length <= 100 &&
    amountPerRecipient > 0n
  );

  const { error: simulateError } = useSimulateContract({
    address: contractAddress as `0x${string}`,
    abi: batchPaymentAbi,
    functionName: "batchTransferNative",
    args: [recipientList, amountPerRecipient] as const,
    value: total,
    query: { enabled: isValid },
  });

  const { writeContract, isPending: isWriting } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    setTxHash(undefined);

    if (!isValid) {
      setSubmissionError("Please fill all fields with valid values.");
      return;
    }

    if (total > (balance?.value ?? 0n)) {
      setSubmissionError("Insufficient balance to cover total transfer.");
      return;
    }

    try {
      const hash = (await writeContract({
        address: contractAddress as `0x${string}`,
        abi: batchPaymentAbi,
        functionName: "batchTransferNative",
        args: [recipientList, amountPerRecipient] as const,
        value: total,
      })) as `0x${string}` | undefined;
      if (hash) setTxHash(hash);
    } catch (err: any) {
      setSubmissionError(err?.shortMessage || err?.message || "Transaction failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          BatchPayment contract address
        </label>
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="0x..."
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-arc-500 focus:outline-none focus:ring-1 focus:ring-arc-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Recipients (one address per line, max 100)
        </label>
        <textarea
          value={recipientsRaw}
          onChange={(e) => setRecipientsRaw(e.target.value)}
          rows={8}
          placeholder="0x..."
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-arc-500 focus:outline-none focus:ring-1 focus:ring-arc-500"
        />
        <p className="mt-1 text-xs text-slate-500">
          Valid addresses: {recipientList.length} / 100
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Amount per recipient (USDC)
        </label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-arc-500 focus:outline-none focus:ring-1 focus:ring-arc-500"
        />
        <p className="mt-1 text-xs text-slate-500">
          Total: {Number(amount || 0) * recipientList.length} USDC
        </p>
      </div>

      {(simulateError || submissionError) && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {submissionError || simulateError?.message}
        </div>
      )}

      <button
        type="submit"
        disabled={!isValid || isWriting || isConfirming}
        className="w-full rounded-lg bg-arc-600 px-4 py-2 text-sm font-semibold text-white hover:bg-arc-500 disabled:cursor-not-allowed disabled:bg-slate-300 transition"
      >
        {isWriting
          ? "Submitting..."
          : isConfirming
          ? "Confirming..."
          : "Send Batch"}
      </button>

      {isSuccess && txHash && (
        <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Success!{" "}
          <a
            href={`${arcTestnet.blockExplorers.default.url}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
          >
            View on explorer
          </a>
        </div>
      )}
    </form>
  );
}
