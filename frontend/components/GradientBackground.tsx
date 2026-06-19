"use client";

/**
 * Dithered "cloud" desktop wallpaper.
 * Pure CSS, two inks only (web-blue + white): a flat blue field, soft white
 * cloud blobs built from radial gradients, and a halftone dither overlay that
 * slowly drifts to read as a living Y2K desktop.
 */
export function GradientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-blu">
      {/* Cloud layer — white radial puffs drifting across the blue field. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 motion-safe:animate-clouddrift"
        style={{
          backgroundImage: `
            radial-gradient(closest-side, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%),
            radial-gradient(closest-side, rgba(255,255,255,0.40), rgba(255,255,255,0) 70%)
          `,
          backgroundRepeat: "repeat-x, repeat-x",
          backgroundSize: "520px 320px, 380px 240px",
          backgroundPosition: "0 22%, 120px 64%",
        }}
      />
      {/* Halftone dither over the whole desktop (white dots on blue). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-50 motion-safe:animate-dither"
        style={{
          backgroundColor: "transparent",
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.6) 0.7px, transparent 1px)",
          backgroundSize: "4px 4px",
        }}
      />
      {/* Faint scanlines for CRT texture. */}
      <div aria-hidden="true" className="absolute inset-0 scanlines opacity-40" />
    </div>
  );
}
