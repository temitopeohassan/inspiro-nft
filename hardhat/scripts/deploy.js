const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const factory = await hre.ethers.deployContract("NFTFactory");
  await factory.waitForDeployment();
  console.log("NFTFactory deployed to:", factory.target);

  // Brief delay so RPC nonce is updated before next tx
  await new Promise(r => setTimeout(r, 2000));

  // Deploy a sample collection via the factory (uses deployer for all treasuries)
  try {
    const feeData = await hre.ethers.provider.getFeeData();
    const tx = await factory.createPaidCollection(
      "Inspiro Test",
      "INSP",
      "ipfs://QmPlaceholder/",
      100,
      hre.ethers.parseEther("0.001"),
      deployer.address,
      deployer.address,
      deployer.address,
      4000,
      4000,
      2000,
      500,
      deployer.address,
      {
        gasLimit: 6_000_000,
        maxFeePerGas: (feeData.maxFeePerGas ?? feeData.gasPrice) * 120n / 100n,
        maxPriorityFeePerGas: (feeData.maxPriorityFeePerGas ?? feeData.gasPrice ?? 1n) * 120n / 100n
      }
    );
    const receipt = await tx.wait();
    const log = receipt.logs.find(l => {
      try {
        const parsed = factory.interface.parseLog({ topics: l.topics, data: l.data });
        return parsed?.name === "CollectionDeployed";
      } catch { return false; }
    });
    const collectionAddress = log
      ? factory.interface.parseLog({ topics: log.topics, data: log.data }).args.collection
      : "N/A";
    console.log("Sample NFTCollection deployed to:", collectionAddress);
  } catch (err) {
    console.warn("Sample collection creation skipped or failed:", err.shortMessage ?? err.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
