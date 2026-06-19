import type { Metadata, Viewport } from "next";
import { VT323, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Pixel display face for the OS chrome (title bars, headings, taskbar).
const pixel = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

// Clean monospace for body / data readouts.
const mono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NanoCLI — Batch payments on Arc Testnet",
  description:
    "Send USDC to up to 100 recipients in a single transaction. Verified contract, wallet-only, no private keys.",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1c6fd6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${pixel.variable} ${mono.variable}`}>
      <body className="font-mono antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
