import json
import os
import tempfile

import pytest

from nanocli.blockchain import (
    amount_to_wei,
    is_valid_address,
    parse_recipients_file,
    validate_recipients,
    wei_to_amount,
)


def test_is_valid_address():
    assert is_valid_address("0x0000000000000000000000000000000000000001")
    assert not is_valid_address("0x000000000000000000000000000000000000000")  # 39 chars
    assert not is_valid_address("not-an-address")


def test_parse_recipients_file_json():
    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".json") as f:
        json.dump(
            [
                "0x0000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000002",
            ],
            f,
        )
        path = f.name
    try:
        result = parse_recipients_file(path)
        assert len(result) == 2
    finally:
        os.unlink(path)


def test_parse_recipients_file_plain():
    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".txt") as f:
        f.write("0x0000000000000000000000000000000000000001\n")
        f.write("0x0000000000000000000000000000000000000002\n")
        path = f.name
    try:
        result = parse_recipients_file(path)
        assert len(result) == 2
    finally:
        os.unlink(path)


def test_validate_recipients_success():
    addresses = [
        "0x0000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000002",
    ]
    validated = validate_recipients(addresses)
    assert len(validated) == 2
    assert validated[0] == "0x0000000000000000000000000000000000000001"


def test_validate_recipients_empty():
    with pytest.raises(ValueError, match="empty"):
        validate_recipients([])


def test_validate_recipients_too_many():
    addresses = ["0x0000000000000000000000000000000000000001"] * 101
    with pytest.raises(ValueError, match="Too many"):
        validate_recipients(addresses)


def test_validate_recipients_invalid():
    with pytest.raises(ValueError, match="Invalid address"):
        validate_recipients(["0xbad"])


def test_amount_to_wei_18_decimals():
    assert amount_to_wei("0.05", 18) == 50000000000000000


def test_amount_to_wei_6_decimals():
    assert amount_to_wei("0.05", 6) == 50000


def test_wei_to_amount():
    assert wei_to_amount(50000000000000000, 18) == "0.050000"
