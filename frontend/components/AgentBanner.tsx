import { Bot, Sparkles } from "lucide-react";

export function AgentBanner() {
  const ticker =
    "NANO AGENT // an autonomous process that watches your balance, predicts refills, and executes batch micro-payments on your behalf — coming soon //";

  return (
    <div className="bevel-out overflow-hidden font-mono text-blu-deep">
      <div className="flex items-stretch">
        {/* Icon plate */}
        <div className="dither-on-blue flex shrink-0 items-center gap-2 px-3 text-white">
          <Bot className="h-5 w-5" />
          <span className="hidden font-pixel text-xl leading-none sm:inline">
            NANO AGENT
          </span>
        </div>

        {/* Marquee ticker */}
        <div className="relative flex-1 overflow-hidden bg-white">
          <div className="flex whitespace-nowrap py-1.5 motion-safe:animate-marquee">
            <span className="px-4 text-[11px] font-bold uppercase tracking-wide">
              {ticker}
            </span>
            <span className="px-4 text-[11px] font-bold uppercase tracking-wide" aria-hidden="true">
              {ticker}
            </span>
          </div>
        </div>

        {/* Status chip */}
        <div className="hidden shrink-0 items-center gap-1.5 border-l border-blu-deep bg-white px-3 sm:flex">
          <Sparkles className="h-3.5 w-3.5 text-blu" />
          <span className="bevel-in px-2 py-0.5 text-[9px] font-bold uppercase">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  );
}
