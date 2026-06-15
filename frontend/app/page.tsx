import { ConnectButton } from "@/components/ConnectButton";
import { Balance } from "@/components/Balance";
import { BatchForm } from "@/components/BatchForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-arc-600 text-white font-bold">
              N
            </div>
            <h1 className="text-lg font-bold text-slate-900">NanoCLI</h1>
          </div>
          <div className="flex items-center gap-4">
            <Balance />
            <ConnectButton />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            Batch USDC micro-transfers
          </h2>
          <p className="mt-2 text-slate-600">
            Send $0.05 USDC to up to 100 recipients in a single transaction on
            Arc Testnet.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
          <BatchForm />
        </div>
      </section>
    </main>
  );
}
