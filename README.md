# NanoCLI

> **One command sends $0.05 USDC to 100 recipients. A lightweight agent monitors the balance and auto-refills.**

NanoCLI is a production-ready stack for batch micro-transfers on **Arc Testnet** (Circle's stablecoin-native L1). It includes:

- **Solidity batch-payment contract** (`BatchPayment.sol`) — one transaction, up to 100 recipients.
- **Hardhat + Viem deployment pipeline** — compile, test, and deploy to Arc Testnet.
- **Python CLI** — `send-batch`, `agent`, `balance`, and `deploy-contract` commands.
- **Next.js dashboard** — connect a wallet, paste a recipient list, and execute batch transfers from the browser.

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
│   ├── components/
│   └── config/
├── cli/                # Python CLI
│   ├── nanocli/
│   └── tests/
├── .env.example
├── README.md
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

### 2. Configure environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Required for deployment:

```ini
ARC_TESTNET_RPC_URL=https://arc-testnet.drpc.org
PRIVATE_KEY=0x...        # Your deployer wallet private key
```

> ⚠️ Never commit `.env` — it is already ignored by `.gitignore`.

### 3. Compile contracts

```bash
npm run compile
```

### 4. Run tests

```bash
npm run test
```

### 5. Start local stack

```bash
# Terminal 1 — local Hardhat node
npm run node:local

# Terminal 2 — deploy the contract locally
npm run deploy:local

# Terminal 3 — start the frontend
npm run dev --workspace=frontend
```

Open [http://localhost:3000](http://localhost:3000) and connect your wallet.

---

## 🌐 Deploy to Arc Testnet

### 1. Fund your wallet

Get testnet USDC from the [Circle Faucet](https://faucet.circle.com/) by selecting **Arc Testnet** and pasting your wallet address.

### 2. Deploy the contract

```bash
npm run deploy:arc
```

The script prints the deployed address and a link to the explorer. Save it to your `.env`:

```ini
BATCH_PAYMENT_CONTRACT_ADDRESS=0x...
```

### 3. Use the contract

From the CLI:

```bash
nanocli send-batch recipients.json \
  --contract $BATCH_PAYMENT_CONTRACT_ADDRESS \
  --amount 0.05 \
  --rpc $ARC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY
```

Or open the frontend at `http://localhost:3000`, paste the recipient list, and submit.

---

## 🛠 Python CLI

Install the CLI locally:

```bash
cd cli
python -m pip install -e .
```

### Commands

```bash
# Send $0.05 USDC to 100 recipients in one transaction
nanocli send-batch recipients.json --contract 0x... --amount 0.05

# Run the balance monitor / auto-refill agent
nanocli agent \
  --watch 0x... \
  --min-balance 1.0 \
  --refill-amount 5.0 \
  --vault-key $VAULT_PRIVATE_KEY \
  --interval 60

# Check native or ERC20 balance
nanocli balance --address 0x... --token 0x... --rpc $ARC_TESTNET_RPC_URL
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
| `npm run test:contracts` | Hardhat + Viem contract tests |
| `npm run test:frontend` | Next.js + Jest component tests |
| `npm run test:cli` | Python CLI unit tests |
| `npm run lint` | ESLint on frontend and contracts |
| `npm run typecheck` | TypeScript `tsc --noEmit` |
| `npm run build` | Production build of frontend and contracts |

---

## 🔗 Useful links

- [Arc Testnet Explorer](https://testnet.arcscan.app/)
- [Circle Faucet for Arc Testnet](https://faucet.circle.com/)
- [Arc Documentation](https://docs.arc.network/)
- [Arc Network website](https://www.arc.network/)

---

## 📄 License

MIT — see [LICENSE](LICENSE).
