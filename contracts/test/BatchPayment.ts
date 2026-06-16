import { expect } from "chai";
import hre from "hardhat";
import { parseEther, getAddress } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

describe("BatchPayment", function () {
  async function deployFixture() {
    const [owner, alice, bob, ...others] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();
    const batchPayment = await hre.viem.deployContract("BatchPayment", [
      owner.account.address,
    ]);
    const nanoUsdc = await hre.viem.deployContract("NanoUSDC", [1_000_000n]);
    return {
      batchPayment,
      nanoUsdc,
      owner,
      alice,
      bob,
      others,
      publicClient,
    };
  }

  describe("deployment", function () {
    it("sets the deployer as owner", async function () {
      const { batchPayment, owner } = await loadFixture(deployFixture);
      const contractOwner = (await batchPayment.read.owner()) as `0x${string}`;
      expect(getAddress(contractOwner)).to.equal(
        getAddress(owner.account.address)
      );
    });
  });

  describe("batchTransferNative", function () {
    it("reverts with zero recipients", async function () {
      const { batchPayment } = await loadFixture(deployFixture);
      await expect(
        batchPayment.write.batchTransferNative(
          [[], parseEther("0.05")],
          { value: 0n }
        )
      ).to.be.rejectedWith("InvalidRecipientCount");
    });

    it("reverts with too many recipients", async function () {
      const { batchPayment, alice } = await loadFixture(deployFixture);
      const recipients = Array.from({ length: 101 }, () => alice.account.address);
      await expect(
        batchPayment.write.batchTransferNative(
          [recipients, parseEther("0.05")],
          { value: parseEther("5.05") }
        )
      ).to.be.rejectedWith("InvalidRecipientCount");
    });

    it("reverts with zero amount", async function () {
      const { batchPayment, alice } = await loadFixture(deployFixture);
      await expect(
        batchPayment.write.batchTransferNative(
          [[alice.account.address], 0n],
          { value: 0n }
        )
      ).to.be.rejectedWith("ZeroAmount");
    });

    it("reverts with incorrect native value", async function () {
      const { batchPayment, alice, bob } = await loadFixture(deployFixture);
      await expect(
        batchPayment.write.batchTransferNative(
          [[alice.account.address, bob.account.address], parseEther("0.05")],
          { value: parseEther("0.09") }
        )
      ).to.be.rejectedWith("IncorrectNativeValue");
    });

    it("distributes native value evenly to recipients", async function () {
      const { batchPayment, alice, bob, publicClient } = await loadFixture(
        deployFixture
      );
      const recipients = [alice.account.address, bob.account.address];
      const amountPerRecipient = parseEther("0.05");
      const total = amountPerRecipient * 2n;

      const aliceBefore = await publicClient.getBalance({
        address: alice.account.address,
      });
      const bobBefore = await publicClient.getBalance({
        address: bob.account.address,
      });

      const tx = await batchPayment.write.batchTransferNative(
        [recipients, amountPerRecipient],
        { value: total }
      );
      await publicClient.waitForTransactionReceipt({ hash: tx });

      const aliceAfter = await publicClient.getBalance({
        address: alice.account.address,
      });
      const bobAfter = await publicClient.getBalance({
        address: bob.account.address,
      });

      expect(aliceAfter - aliceBefore).to.equal(amountPerRecipient);
      expect(bobAfter - bobBefore).to.equal(amountPerRecipient);
    });
  });

  describe("batchTransferERC20", function () {
    it("reverts with zero recipients", async function () {
      const { batchPayment, nanoUsdc } = await loadFixture(deployFixture);
      await expect(
        batchPayment.write.batchTransferERC20([
          nanoUsdc.address,
          [],
          1000000n,
        ])
      ).to.be.rejectedWith("InvalidRecipientCount");
    });

    it("reverts with zero amount", async function () {
      const { batchPayment, nanoUsdc, alice } = await loadFixture(deployFixture);
      await expect(
        batchPayment.write.batchTransferERC20([
          nanoUsdc.address,
          [alice.account.address],
          0n,
        ])
      ).to.be.rejectedWith("ZeroAmount");
    });

    it("distributes ERC20 tokens evenly to recipients", async function () {
      const {
        batchPayment,
        nanoUsdc,
        alice,
        bob,
        publicClient,
      } = await loadFixture(deployFixture);
      const recipients = [alice.account.address, bob.account.address];
      const amountPerRecipient = 1000000n; // 1 nUSDC
      const total = amountPerRecipient * 2n;

      const approveTx = await nanoUsdc.write.approve([
        batchPayment.address,
        total,
      ]);
      await publicClient.waitForTransactionReceipt({ hash: approveTx });

      const tx = await batchPayment.write.batchTransferERC20([
        nanoUsdc.address,
        recipients,
        amountPerRecipient,
      ]);
      await publicClient.waitForTransactionReceipt({ hash: tx });

      const aliceBalance = await nanoUsdc.read.balanceOf([
        alice.account.address,
      ]);
      const bobBalance = await nanoUsdc.read.balanceOf([bob.account.address]);

      expect(aliceBalance).to.equal(amountPerRecipient);
      expect(bobBalance).to.equal(amountPerRecipient);
    });
  });
});
