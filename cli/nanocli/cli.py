import json
import sys

import click
from rich.console import Console
from rich.table import Table

from nanocli import __version__
from nanocli.blockchain import (
    BlockchainClient,
    amount_to_wei,
    parse_recipients_file,
    validate_recipients,
    wei_to_amount,
)
from nanocli.config import (
    ARC_TESTNET_RPC_URL,
    BATCH_PAYMENT_CONTRACT_ADDRESS,
    DEFAULT_DECIMALS,
    EXPLORER_URL,
    MAX_RECIPIENTS,
    PRIVATE_KEY,
    VAULT_KEY,
)
from nanocli.monitor import BalanceMonitor

console = Console()


def _print_receipt(client: BlockchainClient, tx_hash: str) -> None:
    try:
        receipt = client.wait_for_receipt(tx_hash)
        table = Table(title="Transaction receipt")
        table.add_column("Field", style="cyan")
        table.add_column("Value", style="magenta")
        table.add_row("Hash", tx_hash)
        table.add_row("Status", "success" if receipt.status == 1 else "failed")
        table.add_row("Block", str(receipt.blockNumber))
        table.add_row("Gas used", str(receipt.gasUsed))
        table.add_row("Explorer", f"{EXPLORER_URL}/tx/{tx_hash}")
        console.print(table)
    except Exception as e:
        console.print(f"[yellow]Transaction sent but receipt not ready: {tx_hash}[/yellow]")
        console.print(f"[yellow]Error: {e}[/yellow]")


@click.group()
@click.version_option(version=__version__, prog_name="nanocli")
def main():
    """NanoCLI — batch USDC micro-transfers on Arc Testnet."""
    pass


@main.command()
@click.argument("recipients_file", type=click.Path(exists=True))
@click.option("--contract", default=BATCH_PAYMENT_CONTRACT_ADDRESS, help="BatchPayment contract address")
@click.option("--amount", default="0.05", help="Amount per recipient (USDC)")
@click.option("--token", default=None, help="ERC20 token address. If omitted, native USDC is used.")
@click.option("--decimals", default=DEFAULT_DECIMALS, type=int, help="Token decimals")
@click.option("--private-key", default=PRIVATE_KEY, help="Sender private key")
@click.option("--rpc", default=ARC_TESTNET_RPC_URL, help="RPC URL")
@click.option("--wait/--no-wait", default=True, help="Wait for transaction receipt")
def send_batch(
    recipients_file,
    contract,
    amount,
    token,
    decimals,
    private_key,
    rpc,
    wait,
):
    """Send a fixed amount to each recipient in one transaction."""
    if not contract:
        console.print("[red]Error: --contract or BATCH_PAYMENT_CONTRACT_ADDRESS is required[/red]")
        sys.exit(1)
    if not private_key:
        console.print("[red]Error: --private-key or NANOCLI_PRIVATE_KEY is required[/red]")
        sys.exit(1)

    try:
        raw_recipients = parse_recipients_file(recipients_file)
        recipients = validate_recipients(raw_recipients, MAX_RECIPIENTS)
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        sys.exit(1)

    client = BlockchainClient(rpc)
    account = client.get_account(private_key)

    console.print(f"Sender: {account.address}")
    console.print(f"Recipients: {len(recipients)}")
    console.print(f"Amount per recipient: {amount} USDC")
    console.print(f"Total: {float(amount) * len(recipients)} USDC")

    try:
        if token:
            tx_hash = client.send_batch_erc20(
                contract, token, recipients, amount, private_key, decimals
            )
        else:
            tx_hash = client.send_batch_native(
                contract, recipients, amount, private_key, decimals
            )
        console.print(f"[green]Transaction hash: {tx_hash}[/green]")
        if wait:
            _print_receipt(client, tx_hash)
    except Exception as e:
        console.print(f"[red]Transaction failed: {e}[/red]")
        sys.exit(1)


@main.command()
@click.option("--watch", required=True, help="Address to monitor")
@click.option("--min-balance", default="1.0", help="Refill threshold")
@click.option("--refill-amount", default="5.0", help="Amount to send when refilling")
@click.option("--vault-key", default=VAULT_KEY, help="Vault private key")
@click.option("--token", default=None, help="ERC20 token address (native if omitted)")
@click.option("--decimals", default=DEFAULT_DECIMALS, type=int, help="Token decimals")
@click.option("--interval", default=60, type=int, help="Check interval in seconds")
@click.option("--rpc", default=ARC_TESTNET_RPC_URL, help="RPC URL")
def agent(
    watch,
    min_balance,
    refill_amount,
    vault_key,
    token,
    decimals,
    interval,
    rpc,
):
    """Run the balance monitor / auto-refill agent."""
    if not vault_key:
        console.print("[red]Error: --vault-key or NANOCLI_VAULT_KEY is required[/red]")
        sys.exit(1)

    monitor = BalanceMonitor(rpc)
    monitor.run(watch, min_balance, refill_amount, vault_key, token, decimals, interval)


@main.command()
@click.option("--address", required=True, help="Address to check")
@click.option("--token", default=None, help="ERC20 token address (native if omitted)")
@click.option("--decimals", default=DEFAULT_DECIMALS, type=int, help="Token decimals")
@click.option("--rpc", default=ARC_TESTNET_RPC_URL, help="RPC URL")
def balance(address, token, decimals, rpc):
    """Check native or ERC20 balance."""
    client = BlockchainClient(rpc)
    value = client.get_balance(address, token)
    symbol = "USDC" if not token else "token"
    console.print(f"{address}: {wei_to_amount(value, decimals)} {symbol}")


@main.command()
@click.argument("recipients", nargs=-1, required=True)
def validate(recipients):
    """Validate a list of addresses."""
    try:
        validated = validate_recipients(list(recipients), MAX_RECIPIENTS)
        console.print(f"[green]Valid addresses: {len(validated)}[/green]")
    except Exception as e:
        console.print(f"[red]{e}[/red]")
        sys.exit(1)


if __name__ == "__main__":
    main()
