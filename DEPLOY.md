# Deploy NanoCLI to Arc Testnet

This guide walks through deploying the `BatchPayment` contract to Arc Testnet using your own wallet.

## 1. Get a wallet and fund it

1. Install a Web3 wallet (MetaMask, Rabby, etc.).
2. Add **Arc Testnet** manually:
   - Network name: `Arc Testnet`
   - RPC URL: `https://arc-testnet.drpc.org` (or `https://rpc.testnet.arc.network`)
   - Chain ID: `5042002`
   - Currency symbol: `USDC`
   - Block explorer: `https://testnet.arcscan.app`
3. Visit the [Circle Faucet](https://faucet.circle.com/), select **Arc Testnet**, paste your wallet address and request testnet USDC.

## 2. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```ini
ARC_TESTNET_RPC_URL=https://arc-testnet.drpc.org
PRIVATE_KEY=0x...        # Your wallet private key with 0x prefix
```

> ⚠️ Never commit `.env` or share your private key.

## 3. Compile and test

```bash
npm run compile
npm run test
```

## 4. Deploy the contract

```bash
npm run deploy:arc
```

The script will print the deployed address and a link to the explorer. Save it:

```ini
BATCH_PAYMENT_CONTRACT_ADDRESS=0x...
```

## 5. Verify the deployment

1. Open the explorer link from the deployment output.
2. Confirm the contract bytecode and deployer address match.
3. Optionally send a test transaction using the CLI:

```bash
nanocli send-batch recipients.json \
  --contract $BATCH_PAYMENT_CONTRACT_ADDRESS \
  --amount 0.05 \
  --rpc $ARC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY
```

## 6. Start the frontend locally

```bash
npm run dev --workspace=frontend
```

Open [http://localhost:3000](http://localhost:3000), connect the same wallet, paste the deployed contract address and a recipient list, then submit the batch transfer.

## 7. Run the auto-refill agent

```bash
nanocli agent \
  --watch $WATCH_ADDRESS \
  --min-balance 1.0 \
  --refill-amount 5.0 \
  --vault-key $VAULT_PRIVATE_KEY \
  --interval 60
```

The agent will monitor the watched address and send a refill when the balance drops below the threshold.

---

## Useful commands

| Command | Description |
|---|---|
| `npm run compile` | Compile Solidity contracts |
| `npm run test` | Run all contract, frontend, and CLI tests |
| `npm run build` | Production build |
| `npm run deploy:arc` | Deploy to Arc Testnet |
| `npm run node:local` | Start a local Hardhat node |
| `npm run deploy:local` | Deploy to a local Hardhat node |
