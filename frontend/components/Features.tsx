import { ShieldCheck, Zap, Layers, Bot } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified",
    description: "Source code is public and verified on ArcScan.",
  },
  {
    icon: Zap,
    title: "One transaction",
    description: "Reach up to 100 recipients in a single call.",
  },
  {
    icon: Layers,
    title: "Native USDC",
    description: "Built for Arc Testnet gas token.",
  },
  {
    icon: Bot,
    title: "AI Agent",
    description: "Soon: an autonomous agent that monitors, refills, and pays.",
  },
];

export function Features() {
  return (
    <div className="grid gap-4">
      {features.map(({ icon: Icon, title, description }) => (
        <div
          key={title}
          className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/15 hover:bg-white/[0.06]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 text-indigo-300 ring-1 ring-inset ring-white/10 transition group-hover:from-indigo-500/30 group-hover:to-cyan-500/20">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
