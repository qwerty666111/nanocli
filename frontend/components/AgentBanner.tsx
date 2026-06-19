import { Bot, Sparkles, ArrowRight } from "lucide-react";

export function AgentBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/20 via-slate-900/50 to-cyan-600/20 p-6 sm:p-8">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/25">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">Nano Agent</h2>
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/20">
                Coming soon
              </span>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">
              An AI agent that watches your balance, predicts refills, and executes batch micro-payments on your behalf — just tell it what to do.
            </p>
          </div>
        </div>

        <div className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 sm:w-auto">
          <Sparkles className="h-4 w-4 text-indigo-300" />
          <span>Autonomous payouts</span>
          <ArrowRight className="h-4 w-4 text-slate-500" />
        </div>
      </div>
    </div>
  );
}
