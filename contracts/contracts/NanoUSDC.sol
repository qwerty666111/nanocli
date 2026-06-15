// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title NanoUSDC
/// @notice Local/testnet ERC20 token with the same decimals as mainnet USDC (6).
contract NanoUSDC is ERC20 {
    constructor(uint256 initialSupply) ERC20("NanoUSDC", "nUSDC") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
