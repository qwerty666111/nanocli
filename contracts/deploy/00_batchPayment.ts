import { viem } from "hardhat";

async function main() {
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  const batchPayment = await viem.deployContract("BatchPayment", [
    deployer.account.address,
  ]);
  const address = batchPayment.address;

  const balance = await publicClient.getBalance({
    address: deployer.account.address,
  });

  console.log("Deployer:", deployer.account.address);
  console.log("Deployer balance:", balance.toString());
  console.log("BatchPayment deployed to:", address);
  console.log(
    "Explorer:",
    `https://testnet.arcscan.app/address/${address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
