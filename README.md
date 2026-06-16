# NanoCLI

> **One command sends $0.05 USDC to 100 recipients. A lightweight agent monitors the balance and auto-refills.**

NanoCLI is a production-ready stack for batch micro-transfers on **Arc Testnet** (Circle's stablecoin-native L1). It includes:

- **Solidity batch-payment contract** (`BatchPayment.sol`) — one transaction, up to 100 recipients.
- **Hardhat + Viem** — compile and test contracts.
- **Python CLI** — `send-batch`, `agent`, `balance`, and `validate` commands.
- **Next.js dashboard** — connect a wallet, deploy the contract once from a local page, and execute batch transfers from the browser.

> **No `.env` files are required.** The contract is deployed from the browser via the connected wallet.

---

## 📦 Repository structure

```
.
├── contracts/          # Hardhat + Solidity
│   ├── contracts/
│   │   ├── BatchPayment.sol
│   │   └── NanoUSDC.sol
│   ├── test/
│   ├── deploy/
│   └── hardhat.config.ts
├── frontend/           # Next.js + Tailwind + Wagmi/Viem
│   ├── app/
│   ├── api/            # local deployment persistence
│   ├── components/
│   └── config/
├── cli/                # Python CLI
│   ├── nanocli/
│   └── tests/
├── deployed.json       # auto-created after browser deployment
├── README.md
├── DEPLOY.md
└── LICENSE
```

---

## 🚀 Quick start

### 1. Clone and install

```bash
git clone https://github.com/<your-org>/nanocli.git
cd nanocli

# Node dependencies
npm install

# Python CLI dependencies
cd cli
python -m pip install -e .
cd ..
```

### 2. Compile and test

```bash
npm run compile
npm run test
```

### 3. Start the local dashboard

```bash
npm run dev --workspace=frontend
```

Open [http://localhost:3000](http://localhost:3000) and connect your wallet.

### 4. Deploy the contract from the browser

1. Switch your wallet to **Arc Testnet** (chainId `5042002`).
2. Click **Deploy contract** in the top right corner.
3. Click **Deploy BatchPayment** — the contract is deployed directly from your wallet.
4. The deployed address is automatically saved to `deployed.json` and used by the dashboard.

### 5. Send a batch transfer

On the main page:

1. Paste up to 100 recipient addresses.
2. Set the amount per recipient (default $0.05 USDC).
3. Click **Send Batch**.

---

## 🌐 Funding the wallet

Get testnet USDC from the [Circle Faucet](https://faucet.circle.com/) by selecting **Arc Testnet** and pasting your wallet address.

---

## 🛠 Python CLI

Install the CLI locally:

```bash
cd cli
python -m pip install -e .
```

### Commands

```bash
# Send $0.05 USDC to 100 recipients in one transaction.
# If deployed.json exists, --contract is optional.
nanocli send-batch recipients.json --amount 0.05 --private-key 0x...

# Run the balance monitor / auto-refill agent
nanocli agent \
  --watch 0x... \
  --min-balance 1.0 \
  --refill-amount 5.0 \
  --vault-key 0x... \
  --interval 60

# Check native or ERC20 balance
nanocli balance --address 0x... --token 0x...
```

Recipient JSON format (`recipients.json`):

```json
[
  "0x0000000000000000000000000000000000000001",
  "0x0000000000000000000000000000000000000002"
]
```

---

## 🧪 Testing

| Command | What it runs |
|---|---|
| `npm run compile` | Hardhat contract compilation |
| `npm run test` | All contract, frontend, and CLI tests |
| `npm run lint` | ESLint on frontend and contracts |
| `npm run typecheck` | TypeScript `tsc --noEmit` |
| `npm run build` | Production build |

---

## 🔗 Useful links

- [Arc Testnet Explorer](https://testnet.arcscan.app/)
- [Circle Faucet for Arc Testnet](https://faucet.circle.com/)
- [Arc Documentation](https://docs.arc.network/)
- [Arc Network website](https://www.arc.network/)

---

## 📄 License

MIT — see [LICENSE](LICENSE).
