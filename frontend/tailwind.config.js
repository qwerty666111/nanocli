const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Pixel display face is the default "sans" so headings/chrome read retro.
        sans: ["var(--font-pixel)", ...fontFamily.sans],
        pixel: ["var(--font-pixel)", "monospace"],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
      colors: {
        // STRICTLY two colors: flat web-blue + white.
        blu: {
          DEFAULT: "#1c6fd6",
          ink: "#0f4fa0", // darker blue for borders / shadow only (still "blue")
          deep: "#0a3a7a",
        },
        paper: "#ffffff",
      },
      keyframes: {
        // Blinking terminal cursor.
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        // Subtle dither shimmer — drifts the halftone texture.
        dither: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "16px 16px" },
        },
        // Slow wallpaper cloud drift.
        clouddrift: {
          "0%": { backgroundPosition: "0 0, 0 0" },
          "100%": { backgroundPosition: "240px 0, -180px 0" },
        },
        // Marquee for the status / agent ticker.
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        blink: "blink 1.06s steps(1) infinite",
        dither: "dither 1.2s linear infinite",
        clouddrift: "clouddrift 90s linear infinite",
        marquee: "marquee 22s linear infinite",
      },
    },
  },
  plugins: [],
};
