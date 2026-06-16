import json
import os
from pathlib import Path

from dotenv import load_dotenv


def _load_env() -> None:
    """Load .env from project root if present."""
    current = Path(__file__).resolve()
    for parent in [current.parent, current.parent.parent, current.parent.parent.parent]:
        env_file = parent / ".env"
        if env_file.exists():
            load_dotenv(env_file)
            break


_load_env()


def _load_deployed() -> str:
    """Read the deployed contract address from deployed.json if it exists."""
    current = Path(__file__).resolve()
    for parent in [current.parent, current.parent.parent, current.parent.parent.parent]:
        deployed_file = parent / "deployed.json"
        if deployed_file.exists():
            try:
                return str(json.loads(deployed_file.read_text())["contractAddress"])
            except (KeyError, ValueError, FileNotFoundError):
                return ""
    return ""


# Environment-aware defaults
ARC_TESTNET_RPC_URL = os.getenv("ARC_TESTNET_RPC_URL", "https://arc-testnet.drpc.org")
BATCH_PAYMENT_CONTRACT_ADDRESS = os.getenv(
    "BATCH_PAYMENT_CONTRACT_ADDRESS", _load_deployed()
)
PRIVATE_KEY = os.getenv("NANOCLI_PRIVATE_KEY", os.getenv("PRIVATE_KEY", ""))
VAULT_KEY = os.getenv("NANOCLI_VAULT_KEY", "")

DEFAULT_DECIMALS = int(os.getenv("NANOCLI_DECIMALS", "18"))
MAX_RECIPIENTS = 100
EXPLORER_URL = "https://testnet.arcscan.app"
