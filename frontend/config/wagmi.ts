import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { defineChain, fallback } from "viem";

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        "https://rpc.testnet.arc.network",
        "https://rpc.drpc.testnet.arc.network",
        "https://rpc.blockdaemon.testnet.arc.network",
      ],
    },
    public: {
      http: [
        "https://rpc.testnet.arc.network",
        "https://rpc.drpc.testnet.arc.network",
        "https://rpc.blockdaemon.testnet.arc.network",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Arc Testnet Explorer",
      url: "https://testnet.arcscan.app",
    },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [arcTestnet],
  connectors: [injected()],
  transports: {
    [arcTestnet.id]: fallback([
      http("https://rpc.testnet.arc.network"),
      http("https://rpc.drpc.testnet.arc.network"),
      http("https://rpc.blockdaemon.testnet.arc.network"),
    ]),
  },
});
