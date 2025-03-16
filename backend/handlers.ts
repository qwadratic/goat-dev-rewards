import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { GOAT, GOAT_RPC } from "./goatChain";
import { abi } from "../ignition/deployments/chain-48816/artifacts/GOATDeveloperRewardsModule#GOATDeveloperRewards.json";

// GOAT Testnet3 configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
const walletClient = createWalletClient({ account, chain: GOAT, transport: http(GOAT_RPC) });

// Function to call recordDeployment
export async function recordDeployment(contractAddress: string, deployer: string) {
  try {
    const tx = await walletClient.writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: abi,
      functionName: "recordDeployment",
      args: [contractAddress, deployer],
    });
    console.log(`✅ recordDeployment called: ${tx}`);
  } catch (err) {
    console.error("❌ Failed to call recordDeployment:", err);
  }
}

// Function to call recordInteraction
export async function recordInteraction(contract: string, user: string, gasSpent: bigint) {
  try {
    const tx = await walletClient.writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: abi,
      functionName: "recordInteraction",
      args: [contract, user, gasSpent],
    });
    console.log(`✅ recordInteraction called: ${tx}`);
  } catch (err) {
    console.error("❌ Failed to call recordInteraction:", err);
  }
}