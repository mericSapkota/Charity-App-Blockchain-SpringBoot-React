const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying CharityPlatform...");

  // Platform fee: 250 = 2.5%
  const platformFee = 250;

  const CharityPlatform = await ethers.getContractFactory("CharityPlatform");
  const charity = await CharityPlatform.deploy(platformFee);

  await charity.waitForDeployment();

  const address = await charity.getAddress();
  console.log(`CharityPlatform deployed to: ${address}`);

  // Wait for block confirmations
  console.log("Waiting for block confirmations...");
  await charity.deploymentTransaction().wait(1);

  // console.log("Verifying contract on Etherscan...");
  // await hre.run("verify:verify", {
  //   address: address,
  //   constructorArguments: [platformFee],
  // });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
