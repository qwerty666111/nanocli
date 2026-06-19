# NanoCLI

<p align="center">
  <img src="frontend/public/logo.svg" width="110" alt="NanoCLI logo">
</p>

<p align="center">
  <strong>One command. One transaction. One hundred recipients.</strong><br>
  Micro-payments on Arc Testnet, built for humans and AI agents.
</p>

---

## What is this?

NanoCLI is a tiny but complete stack for sending micro-payments in batches on **Arc Testnet** — Circle's stablecoin-native L1. It ships with a verified Solidity contract, a Next.js dashboard, and a Python CLI. The next step is an AI agent that watches balances, refills gas, and executes payouts on autopilot.

I built it because I was tired of tools that promise "batch payments" but turn out to be CSV uploader dashboards that still charge you a fortune in gas. On Arc, USDC is the native gas token. That changes everything. For the first time, sending $0.05 to a hundred people is actually cheaper than a cup of coffee.

---

## The problem

Sending $0.05 to a hundred people on Ethereum is a joke. Gas alone costs more than the payment itself. Even on cheaper L2s, the workflow is still painful: export a CSV, sign a hundred transactions, or trust some centralized service with your private keys.

Arc flips the whole model: **USDC is the native gas token**. The fee for a transfer is tiny, predictable, and paid in the same currency you are sending. Micro-payments at scale finally make economic sense.

NanoCLI is the first developer-friendly tool I know of that is built specifically for that reality.

---

## What makes it unique

Most "batch transfer" tools are just Excel plugins with extra steps. NanoCLI is different:

- **Contract-first.** The core is a single, verified `BatchPayment` contract. No middleware, no API key, no custodial service holding your keys.
- **Wallet-only.** We never ask for a private key. You deploy and send directly from your browser wallet.
- **Native USDC.** Because Arc uses USDC as gas, the total cost is just the amount you send plus a tiny, predictable fee.
- **AI agent on the roadmap.** The UI already teases *Nano Agent*. The vision is simple: you type something like *"send $0.05 to today's active users"*, and the agent builds the recipient list, checks the balance, and signs the transaction.
- **No `.env` hacks.** The deployed contract address is stored in `deployed.json` and shared by the dashboard and CLI. Anyone can clone the repo and run it.

---

## How it works

1. `BatchPayment.sol` accepts an array of up to 100 addresses and a fixed amount per recipient.
2. You send the exact total as `msg.value`. The contract distributes it in one atomic call.
3. The Next.js dashboard loads the contract address from `deployed.json` and calls the contract via Wagmi/Viem.
4. The Python CLI does the same thing for power users and automation.

That is it. No hidden services, no backend holding secrets.

---

## Live contract

| Network | Address |
|---|---|
| Arc Testnet | `0x813e553133a2543485e904321efffc8d9a133940` |

Verified on [ArcScan](https://testnet.arcscan.app/address/0x813e553133a2543485e904321efffc8d9a133940#code).

---

## Use cases

- **DAO rewards.** Pay contributors for forum activity, bounties, or governance participation without bleeding gas.
- **Game economies.** Distribute small rewards to active players without ruining the unit economics.
- **Micro-salaries.** Pay freelancers or gig workers in near-real time.
- **AI agent settlements.** Let autonomous agents pay each other for data, compute, or API calls.
- **Airdrops and onboarding.** Send a small welcome amount to a cold list of wallets in a single transaction.

---

## Quick start

```bash
git clone https://github.com/qwerty666111/nanocli.git
cd nanocli
npm install

# Python CLI dependencies
cd cli && python -m pip install -e . && cd ..

# Compile contracts and run tests
npm run compile
npm run test

# Start the dashboard
npm run dev --workspace=frontend
```

Open http://127.0.0.1:3000, connect your wallet, switch to Arc Testnet, and send a batch.

### The contract is already deployed

The main page loads the verified address from `deployed.json`. If you want to deploy your own instance, switch to Arc Testnet and open `/deploy`.

---

## Python CLI

```bash
# Send 0.05 USDC to each address in recipients.json
nanocli send-batch recipients.json --amount 0.05 --private-key 0x...

# Monitor a balance and refill from a vault
nanocli agent --watch 0x... --min-balance 1.0 --refill-amount 5.0 --vault-key 0x... --interval 60

# Check native or ERC20 balance
nanocli balance --address 0x... --token 0x...
```

Recipient JSON format:

```json
[
  "0x0000000000000000000000000000000000000001",
  "0x0000000000000000000000000000000000000002"
]
```

---

## Testing

```bash
npm run compile   # Hardhat contract compilation
npm run test      # Contract, frontend, and CLI tests
npm run lint      # ESLint on frontend and contracts
npm run typecheck # TypeScript checks
npm run build     # Production build
```

---

## Roadmap

- [x] Verified `BatchPayment` contract
- [x] Next.js dashboard with wallet connection
- [x] Python CLI
- [x] Dark, premium UI
- [ ] Nano Agent — natural-language batch payments

---

## Links

- Arc Testnet Explorer: https://testnet.arcscan.app
- Circle Faucet: https://faucet.circle.com
- Arc Docs: https://docs.arc.network

---

## License

MIT — see [LICENSE](LICENSE).

---

<p align="center">
  Built for the agentic economy.
</p>
