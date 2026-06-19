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
    <div className="bevel-out font-mono text-blu-deep">
      <div className="dither-on-blue px-2 py-1 font-mono text-[11px] font-bold tracking-tight text-white">
        SYSTEM\FEATURES.INI
      </div>
      <ul className="divide-y divide-dotted divide-blu-deep p-2">
        {features.map(({ icon: Icon, title, description }) => (
          <li key={title} className="flex items-start gap-2.5 py-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center bevel-in text-blu">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div>
              <h3 className="text-[11px] font-bold uppercase">{title}</h3>
              <p className="mt-0.5 text-[11px] leading-snug">{description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
