"use client";

export function GradientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      <div className="absolute -left-1/4 -top-1/4 h-[60rem] w-[60rem] rounded-full bg-indigo-600/10 blur-3xl animate-blob" />
      <div className="absolute right-0 top-1/4 h-[50rem] w-[50rem] rounded-full bg-cyan-500/10 blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/3 h-[55rem] w-[55rem] rounded-full bg-violet-600/10 blur-3xl animate-blob animation-delay-4000" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
