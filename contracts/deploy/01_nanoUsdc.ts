import { viem } from "hardhat";

async function main() {
  const [deployer] = await viem.getWalletClients();

  const nanoUsdc = await viem.deployContract("NanoUSDC", [1_000_000n]);
  const address = nanoUsdc.address;

  const balance = (await nanoUsdc.read.balanceOf([
    deployer.account.address,
  ])) as bigint;

  console.log("Deployer:", deployer.account.address);
  console.log("NanoUSDC deployed to:", address);
  console.log("Deployer token balance:", balance.toString());
  console.log(
    "Explorer:",
    `https://testnet.arcscan.app/address/${address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
