import time
from typing import Optional

from rich.console import Console
from rich.table import Table

from nanocli.blockchain import BlockchainClient, wei_to_amount

console = Console()


class BalanceMonitor:
    def __init__(self, rpc_url: str):
        self.client = BlockchainClient(rpc_url)

    def run(
        self,
        watch_address: str,
        min_balance: str,
        refill_amount: str,
        vault_key: str,
        token: Optional[str] = None,
        decimals: int = 18,
        interval: int = 60,
    ) -> None:
        """Monitor a balance and refill from a vault key when it drops below threshold."""
        console.print(f"[bold]Monitoring[/bold] {watch_address}")
        console.print(f"Token: {token or 'native'}")
        console.print(f"Refill threshold: {min_balance}, refill amount: {refill_amount}")
        console.print(f"Check interval: {interval}s")

        min_wei = self.client.amount_to_wei(min_balance, decimals)
        refill_wei = self.client.amount_to_wei(refill_amount, decimals)

        while True:
            try:
                balance = self.client.get_balance(watch_address, token)
                balance_str = wei_to_amount(balance, decimals)
                console.print(f"Balance: {balance_str}")

                if balance < min_wei:
                    console.print(
                        f"[yellow]Balance below threshold. Refilling {refill_amount}...[/yellow]"
                    )
                    tx_hash = self.client.send_native_transfer(
                        watch_address, refill_amount, vault_key, decimals
                    )
                    receipt = self.client.wait_for_receipt(tx_hash)
                    console.print(
                        f"[green]Refilled. Tx hash: {tx_hash} (block {receipt.blockNumber})[/green]"
                    )
                else:
                    console.print("[green]Balance above threshold.[/green]")

                time.sleep(interval)
            except KeyboardInterrupt:
                console.print("\n[bold]Agent stopped.[/bold]")
                break
            except Exception as e:
                console.print(f"[red]Error: {e}[/red]")
                time.sleep(interval)
