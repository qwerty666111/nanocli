# Deploy NanoCLI to Arc Testnet

This guide walks through deploying the `BatchPayment` contract to Arc Testnet **directly from the local dashboard** using your wallet.

## 1. Get a wallet and fund it

1. Install a Web3 wallet (MetaMask, Rabby, etc.).
2. Add **Arc Testnet** manually:
   - Network name: `Arc Testnet`
   - RPC URL: `https://arc-testnet.drpc.org`
   - Chain ID: `5042002`
   - Currency symbol: `USDC`
   - Block explorer: `https://testnet.arcscan.app`
3. Visit the [Circle Faucet](https://faucet.circle.com/), select **Arc Testnet**, paste your wallet address and request testnet USDC.

## 2. Start the local dashboard

```bash
npm install
cd cli && python -m pip install -e . && cd ..
npm run dev --workspace=frontend
```

Open [http://localhost:3000](http://localhost:3000).

## 3. Deploy the contract from the browser

1. Click **Deploy contract** in the top-right corner.
2. Connect the wallet you funded.
3. Click **Deploy BatchPayment**.
4. Confirm the transaction in your wallet.

The contract address is automatically saved to `deployed.json` and used by the dashboard and CLI.

## 4. Verify the deployment

Open the explorer link shown on the deploy page, or check the transaction hash.

## 5. Send a batch transfer

From the dashboard:

1. Paste up to 100 recipient addresses.
2. Set the amount per recipient.
3. Click **Send Batch**.

Or from the CLI:

```bash
nanocli send-batch recipients.json --amount 0.05 --private-key 0x...
```

If `deployed.json` exists, the CLI will automatically use the saved contract address.

## 6. Run the auto-refill agent

```bash
nanocli agent \
  --watch 0x... \
  --min-balance 1.0 \
  --refill-amount 5.0 \
  --vault-key 0x... \
  --interval 60
```

---

## Useful commands

| Command | Description |
|---|---|
| `npm run compile` | Compile Solidity contracts |
| `npm run test` | Run all contract, frontend, and CLI tests |
| `npm run lint` | Run linters |
| `npm run typecheck` | TypeScript check |
| `npm run build` | Production build |
| `npm run dev --workspace=frontend` | Start local dashboard |
