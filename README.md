% NANOCLI(1) nanocli 0.1.0 | Arc testnet payout tools
% Max Altree
% chain 5042002

# NAME

nanocli — fan one fixed usdc amount out to up to 100 wallets in a single transaction.

# SYNOPSIS

```
nanocli send-batch RECIPIENTS_FILE [--amount USDC] [--token ADDR]
                   [--contract ADDR] [--decimals N] [--rpc URL]
                   [--wait | --no-wait]
nanocli balance  --address ADDR [--token ADDR] [--decimals N] [--rpc URL]
nanocli agent    --watch ADDR [--min-balance USDC] [--refill-amount USDC]
                 [--interval SECONDS] [--token ADDR] [--rpc URL]
nanocli validate ADDR...
```

# DESCRIPTION

a payout sends the same number to many wallets. nanocli does that as one
call. you hand it a list of addresses and a per-recipient amount; the
on-chain **BatchPayment** contract loops the list and pushes that amount to
each one, then emits a single event. one signature, one nonce, one receipt,
n payouts.

the stack is three pieces over the same contract:

  - `contracts/` — solidity `BatchPayment` (openzeppelin Ownable +
    SafeERC20), deployed and verified on arc testnet.
  - `cli/` — this python tool. scripting, cron, headless boxes.
  - `frontend/` — a next.js page (wagmi + viem) that does the same send
    from a browser wallet, capped at the same 100 recipients.

the contract is read once at startup. the cli pulls the address from
`BATCH_PAYMENT_CONTRACT_ADDRESS` or from `deployed.json`; the page pulls it
the same way. nothing is custodial — you sign, the contract forwards, it
never holds your float between calls.

## why this only pencils out on arc

run the arithmetic that kills micro-payouts everywhere else. you want to
send $0.05 to 100 people. on a chain where a transfer costs more than five
cents, the fee on each leg is larger than the leg itself — you would burn
more moving the money than the money you moved. batching 100 transfers into
one call amortizes the per-tx overhead, but it cannot rescue you if every
inner transfer still settles in an asset you have to go acquire, price, and
top up separately from the payout.

arc testnet (chain id 5042002) makes usdc the unit the chain meters fees in.
the dust you send and the fee you pay are the same denominator, settlement
is sub-cent and final on the block, and there is no second balance to refill
before the next run. that is the whole reason a "send a nickel to a hundred
wallets" tool is worth writing here and nowhere else: the payout is the
smallest interesting unit on this chain, not a rounding error beneath the
fee. move nanocli to a chain with a separate volatile fee token and the
product stops making sense — the tool is downstream of arc's fee model.

# OPTIONS

`send-batch RECIPIENTS_FILE`
:   distribute one amount to every address in RECIPIENTS_FILE. the file is
    a json array of addresses, or one address per line. duplicates and
    blanks are dropped; >100 valid addresses is rejected before any
    signing. with no `--token`, the call is `batchTransferNative` and the
    exact total (`amount * count`) rides along as native usdc value; the
    contract reverts `IncorrectNativeValue` if the math disagrees.

`--amount USDC`
:   per-recipient amount. default `0.05`. multiplied by the recipient count
    to form the total.

`--token ADDR`
:   send an erc20 stablecoin instead of native usdc. switches the call to
    `batchTransferERC20`, which does an `approve` for the total, pulls it
    with `safeTransferFrom`, then `safeTransfer`s each leg. omit for native.

`--contract ADDR`
:   override the `BatchPayment` address. defaults to
    `BATCH_PAYMENT_CONTRACT_ADDRESS`, then `deployed.json`.

`--decimals N`
:   token decimals for amount conversion. default `18`.

`--rpc URL`
:   arc testnet rpc endpoint. defaults to `ARC_TESTNET_RPC_URL`.

`--wait` / `--no-wait`
:   block for the receipt and print hash, status, block, gas, explorer
    link. default `--wait`.

`balance --address ADDR`
:   print the native (or `--token`) balance of ADDR. read-only, no key.

`agent --watch ADDR`
:   a local watch loop, NOT an autonomous service. polls `--watch` every
    `--interval` seconds; when its balance drops below `--min-balance`, it
    sends `--refill-amount` from a vault key and logs the tx. it runs only
    while the process is alive and only does this one thing. the "Nano
    Agent" teased on the website — natural-language payouts, predictive
    refills — is a roadmap item, not shipped. there is no hosted agent and
    no x402 anywhere in this repo.

`validate ADDR...`
:   checksum and count a list of addresses without touching the chain. use
    it to vet a recipient set before a real `send-batch`.

# KEYS

do not pass a private key as a command-line flag. it lands in your shell
history and the process table. set it in the environment or a sourced,
non-tracked file instead:

```
export NANOCLI_PRIVATE_KEY=0x...     # used by send-batch
export NANOCLI_VAULT_KEY=0x...       # used by agent's refill
```

`send-batch` reads the sender key from `NANOCLI_PRIVATE_KEY` (or `PRIVATE_KEY`);
`agent` reads its refill key from `NANOCLI_VAULT_KEY`. a `.env` at the repo
root is auto-loaded. keep it out of git. treat any key you put on a real
command line as already leaked.

# EXAMPLES

send the default nickel to everyone in a list, native usdc, wait for receipt:

```
export NANOCLI_PRIVATE_KEY=0x...
nanocli send-batch recipients.json --amount 0.05
```

a recipients file is just addresses:

```json
[
  "0x0000000000000000000000000000000000000001",
  "0x0000000000000000000000000000000000000002"
]
```

pay an erc20 stablecoin with 6 decimals instead of native value:

```
nanocli send-batch payroll.txt --amount 0.25 \
        --token 0xTOKEN... --decimals 6
```

dry-check a set before spending anything:

```
nanocli validate 0xAbc...123 0xDef...456
```

read a balance, no key required:

```
nanocli balance --address 0xAbc...123
```

keep a hot wallet topped up from a vault while you watch the log:

```
export NANOCLI_VAULT_KEY=0x...
nanocli agent --watch 0xHot... --min-balance 1.0 \
        --refill-amount 5.0 --interval 60
```

the browser does the same native send, capped at 100:

```
npm install
npm run compile && npm run test
npm run dev --workspace=frontend   # http://127.0.0.1:3000
```

# CONTRACT

`BatchPayment` is small on purpose. constant `MAX_RECIPIENTS = 100`. two
entry points: `batchTransferNative(address[] recipients, uint256
amountPerRecipient)` (payable, total must equal `msg.value`) and
`batchTransferERC20(address token, address[] recipients, uint256
amountPerRecipient)`. inputs are guarded with custom errors —
`InvalidRecipientCount`, `ZeroAmount`, `IncorrectNativeValue`,
`NativeTransferFailed` — so a bad batch reverts whole, never half-paid. the
deployer is `Ownable`; the only owner powers are `rescueNative` and
`rescueERC20`, for sweeping funds sent in by mistake. it does not custody
between sends.

# FILES

`deployed.json`
:   deployed address + network, read by both cli and frontend.

`.env`
:   optional, repo root. holds keys, rpc, decimals. never commit it.

`recipients.json`
:   user-supplied address list for `send-batch`.

`cli/nanocli/`
:   `cli.py` (commands), `blockchain.py` (signing/sending), `monitor.py`
    (the agent loop), `config.py` (env + deployed.json).

# EXIT STATUS

`0`
:   command completed; for `send-batch --wait`, the tx was mined.

`1`
:   bad input (missing key, invalid/oversized recipient list), rpc/connect
    failure, or a reverted/failed transaction.

# SEE ALSO

  - contract `0x813e553133a2543485e904321efffc8d9a133940` on arc testnet
    (chain 5042002)
  - verified source:
    https://testnet.arcscan.app/address/0x813e553133a2543485e904321efffc8d9a133940
  - live page: https://nanocli.vercel.app/
  - faucet: https://faucet.circle.com — arc docs: https://docs.arc.network

# LICENSE

MIT. see `LICENSE`.
