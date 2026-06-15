import json
import re
from decimal import Decimal
from typing import List, Optional

from eth_account import Account
from web3 import Web3
from web3.contract import Contract

from nanocli.abi import BATCH_PAYMENT_ABI, ERC20_ABI


ADDRESS_REGEX = re.compile(r"^0x[a-fA-F0-9]{40}$")


def is_valid_address(value: str) -> bool:
    return bool(ADDRESS_REGEX.match(value))


def parse_recipients_file(path: str) -> List[str]:
    """Read a JSON or plain-text list of recipient addresses."""
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    content = content.strip()
    if content.startswith("["):
        data = json.loads(content)
        if not isinstance(data, list):
            raise ValueError("JSON file must contain a list of addresses")
        return [str(a).strip() for a in data]
    return [line.strip() for line in content.splitlines() if line.strip()]


def validate_recipients(addresses: List[str], max_count: int = 100) -> List[str]:
    """Normalize and validate a list of addresses."""
    normalized = []
    for raw in addresses:
        addr = raw.strip()
        if not addr:
            continue
        if not is_valid_address(addr):
            raise ValueError(f"Invalid address: {raw}")
        normalized.append(Web3.to_checksum_address(addr))
    if not normalized:
        raise ValueError("Recipient list is empty")
    if len(normalized) > max_count:
        raise ValueError(f"Too many recipients: {len(normalized)} (max {max_count})")
    return normalized


def amount_to_wei(amount: str, decimals: int = 18) -> int:
    """Convert a human-readable amount to the smallest token unit."""
    value = Decimal(str(amount))
    factor = Decimal(10) ** decimals
    return int(value * factor)


def wei_to_amount(wei: int, decimals: int = 18) -> str:
    value = Decimal(wei) / Decimal(10 ** decimals)
    return f"{value:.6f}"


class BlockchainClient:
    def __init__(self, rpc_url: str):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        if not self.w3.is_connected():
            raise ConnectionError(f"Could not connect to RPC: {rpc_url}")

    def get_account(self, private_key: str) -> Account:
        return Account.from_key(private_key)

    def get_balance(self, address: str, token: Optional[str] = None) -> int:
        if token:
            contract = self.w3.eth.contract(address=Web3.to_checksum_address(token), abi=ERC20_ABI)
            return contract.functions.balanceOf(Web3.to_checksum_address(address)).call()
        return self.w3.eth.get_balance(Web3.to_checksum_address(address))

    def get_contract(self, address: str, abi: Optional[list] = None) -> Contract:
        return self.w3.eth.contract(address=Web3.to_checksum_address(address), abi=abi or BATCH_PAYMENT_ABI)

    def send_batch_native(
        self,
        contract_address: str,
        recipients: List[str],
        amount_per_recipient: str,
        private_key: str,
        decimals: int = 18,
    ) -> str:
        account = self.get_account(private_key)
        contract = self.get_contract(contract_address)
        amount_wei = amount_to_wei(amount_per_recipient, decimals)
        total_wei = amount_wei * len(recipients)

        checksum_recipients = [Web3.to_checksum_address(r) for r in recipients]
        tx = contract.functions.batchTransferNative(checksum_recipients, amount_wei).build_transaction(
            {
                "from": account.address,
                "value": total_wei,
                "nonce": self.w3.eth.get_transaction_count(account.address),
                "chainId": self.w3.eth.chain_id,
            }
        )
        estimated = self.w3.eth.estimate_gas(tx)
        tx["gas"] = int(estimated * 1.2)
        signed = self.w3.eth.account.sign_transaction(tx, private_key)
        raw = getattr(signed, "raw_transaction", None) or getattr(
            signed, "rawTransaction", None
        )
        hash_ = self.w3.eth.send_raw_transaction(raw)
        return self.w3.to_hex(hash_)

    def send_batch_erc20(
        self,
        contract_address: str,
        token_address: str,
        recipients: List[str],
        amount_per_recipient: str,
        private_key: str,
        decimals: int = 6,
    ) -> str:
        account = self.get_account(private_key)
        batch_contract = self.get_contract(contract_address)
        token_contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(token_address), abi=ERC20_ABI
        )
        amount_units = amount_to_wei(amount_per_recipient, decimals)
        total_units = amount_units * len(recipients)

        checksum_recipients = [Web3.to_checksum_address(r) for r in recipients]

        # Approve
        approve_tx = token_contract.functions.approve(
            Web3.to_checksum_address(contract_address), total_units
        ).build_transaction(
            {
                "from": account.address,
                "nonce": self.w3.eth.get_transaction_count(account.address),
                "chainId": self.w3.eth.chain_id,
            }
        )
        approve_estimated = self.w3.eth.estimate_gas(approve_tx)
        approve_tx["gas"] = int(approve_estimated * 1.2)
        signed_approve = self.w3.eth.account.sign_transaction(approve_tx, private_key)
        approve_raw = getattr(signed_approve, "raw_transaction", None) or getattr(
            signed_approve, "rawTransaction", None
        )
        approve_hash = self.w3.eth.send_raw_transaction(approve_raw)
        self.w3.eth.wait_for_transaction_receipt(approve_hash)

        # Batch transfer
        tx = batch_contract.functions.batchTransferERC20(
            Web3.to_checksum_address(token_address), checksum_recipients, amount_units
        ).build_transaction(
            {
                "from": account.address,
                "nonce": self.w3.eth.get_transaction_count(account.address),
                "chainId": self.w3.eth.chain_id,
            }
        )
        estimated = self.w3.eth.estimate_gas(tx)
        tx["gas"] = int(estimated * 1.2)
        signed = self.w3.eth.account.sign_transaction(tx, private_key)
        raw = getattr(signed, "raw_transaction", None) or getattr(
            signed, "rawTransaction", None
        )
        hash_ = self.w3.eth.send_raw_transaction(raw)
        return self.w3.to_hex(hash_)

    def send_native_transfer(
        self,
        to: str,
        amount: str,
        private_key: str,
        decimals: int = 18,
    ) -> str:
        account = self.get_account(private_key)
        to_checksum = Web3.to_checksum_address(to)
        value = amount_to_wei(amount, decimals)
        tx = {
            "to": to_checksum,
            "value": value,
            "gas": 21000,
            "nonce": self.w3.eth.get_transaction_count(account.address),
            "chainId": self.w3.eth.chain_id,
        }
        signed = self.w3.eth.account.sign_transaction(tx, private_key)
        raw = getattr(signed, "raw_transaction", None) or getattr(
            signed, "rawTransaction", None
        )
        hash_ = self.w3.eth.send_raw_transaction(raw)
        return self.w3.to_hex(hash_)

    def wait_for_receipt(self, tx_hash: str):
        return self.w3.eth.wait_for_transaction_receipt(tx_hash)
