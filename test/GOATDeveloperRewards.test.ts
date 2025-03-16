import hre from "hardhat";
import { expect } from "chai";
import { parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { GetContractReturnType } from "@nomicfoundation/hardhat-viem/types";
import { abi } from "../artifacts/contracts/GOATDeveloperRewards.sol/GOATDeveloperRewards.json";
import GOATDeveloperRewardsModule from "../ignition/modules/GOATDeveloperRewards";
import { randomBytes } from "crypto";


describe("GOATDeveloperRewards", async function () {

  const randomDeployer = randAccount().address;
  const randomContract = randAccount().address;

  function randAccount() {
    return privateKeyToAccount(`0x${randomBytes(32).toString('hex')}`);
  }

  let nft: GetContractReturnType<typeof abi>;

  before(async function () {
    nft = (await hre.ignition.deploy(GOATDeveloperRewardsModule)).contract as GetContractReturnType<typeof abi>;
  });

  it("Should award First Deployer Badge", async function () {
    await nft.write.recordDeployment([randomContract, randomDeployer]);

    // Check if badge was minted
    const balance = await nft.read.balanceOf([randomDeployer]);
    expect(balance).to.equal(1n);
  });

  it("Should award 10 Unique Users Badge", async function () {
    // Create and record 10 random users
    for (let i = 0; i < 10; i++) {
      const randomAccount = randAccount().address;
      await nft.write.recordInteraction([
        randomContract,
        randomAccount,
        parseEther("0.001")
      ]);
    }

    const balance = await nft.read.balanceOf([randomDeployer]);
    expect(balance).to.equal(2n);
  });

  it("Should award Gas Spent Badge", async function () {
    // Record interactions totaling of >1 eth gas spent
    for (let i = 0; i < 4; i++) {
      const randomAccount = randAccount().address;
      await nft.write.recordInteraction([
        randomContract,
        randomAccount,
        parseEther("0.3")
      ]);
    }

    const balance = await nft.read.balanceOf([randomDeployer]);
    expect(balance).to.equal(3n);
  });

  it("Should correctly determine Speedrun winner", async function () {


    const randomContractNew = randAccount().address;
    const randomDeployerNew = randAccount().address;
    
    await nft.write.recordDeployment([randomContractNew, randomDeployerNew]);
    // 1st badge was minted
    let balance = await nft.read.balanceOf([randomDeployerNew]);
    expect(balance).to.equal(1n);

    await nft.write.toggleSpeedrun([true]);
    // simulate deployer getting their 10 Unique Users NFT within a speedrun session
    for (let i = 0; i < 10; i++) {
      const randomAccount = randAccount().address;
      await nft.write.recordInteraction([
        randomContractNew,
        randomAccount,
        parseEther("0.001")
      ]);
    }

    // check if a deployer got +2 NFTs (for speedrun + for 10 Users milestone)
    balance = await nft.read.balanceOf([randomDeployerNew]);
    expect(balance).to.equal(3n);

    // check if a deployer is stored as last speedrun winner
    const winner = await nft.read.speedrunWinner();
    expect(winner).to.equal(randomDeployerNew);
  });

});
