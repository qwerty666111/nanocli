// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title BatchPayment
/// @notice One transaction distributes a fixed amount of tokens or native value
///         to up to 100 recipients. Designed for Arc Testnet where USDC is the
///         native gas token, but also supports any ERC20 stablecoin.
contract BatchPayment is Ownable {
    using SafeERC20 for IERC20;

    uint256 public constant MAX_RECIPIENTS = 100;

    error InvalidRecipientCount(uint256 count);
    error ZeroAmount();
    error NativeTransferFailed(address recipient);
    error IncorrectNativeValue(uint256 expected, uint256 actual);

    event BatchNativeTransfer(
        address indexed sender,
        uint256 totalAmount,
        uint256 recipientCount,
        uint256 amountPerRecipient
    );

    event BatchERC20Transfer(
        address indexed sender,
        address indexed token,
        uint256 totalAmount,
        uint256 recipientCount,
        uint256 amountPerRecipient
    );

    constructor(address initialOwner) Ownable(initialOwner) {}

    /// @notice Distribute native value (e.g. USDC gas on Arc) evenly across recipients.
    /// @param recipients List of recipient addresses.
    /// @param amountPerRecipient Amount each recipient receives.
    function batchTransferNative(
        address[] calldata recipients,
        uint256 amountPerRecipient
    ) external payable {
        uint256 count = recipients.length;
        if (count == 0 || count > MAX_RECIPIENTS) {
            revert InvalidRecipientCount(count);
        }
        if (amountPerRecipient == 0) {
            revert ZeroAmount();
        }

        uint256 total = amountPerRecipient * count;
        if (msg.value != total) {
            revert IncorrectNativeValue(total, msg.value);
        }

        for (uint256 i = 0; i < count; ++i) {
            (bool success, ) = recipients[i].call{value: amountPerRecipient}("");
            if (!success) {
                revert NativeTransferFailed(recipients[i]);
            }
        }

        emit BatchNativeTransfer(msg.sender, total, count, amountPerRecipient);
    }

    /// @notice Distribute ERC20 tokens across recipients.
    /// @param token Token contract address.
    /// @param recipients List of recipient addresses.
    /// @param amountPerRecipient Amount each recipient receives.
    function batchTransferERC20(
        address token,
        address[] calldata recipients,
        uint256 amountPerRecipient
    ) external {
        uint256 count = recipients.length;
        if (count == 0 || count > MAX_RECIPIENTS) {
            revert InvalidRecipientCount(count);
        }
        if (amountPerRecipient == 0) {
            revert ZeroAmount();
        }

        uint256 total = amountPerRecipient * count;
        IERC20(token).safeTransferFrom(msg.sender, address(this), total);

        for (uint256 i = 0; i < count; ++i) {
            IERC20(token).safeTransfer(recipients[i], amountPerRecipient);
        }

        emit BatchERC20Transfer(
            msg.sender,
            token,
            total,
            count,
            amountPerRecipient
        );
    }

    /// @notice Rescue accidentally sent native value.
    function rescueNative(address to, uint256 amount) external onlyOwner {
        (bool success, ) = to.call{value: amount}("");
        require(success, "rescueNative failed");
    }

    /// @notice Rescue accidentally sent ERC20 tokens.
    function rescueERC20(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).safeTransfer(to, amount);
    }

    receive() external payable {}
}
