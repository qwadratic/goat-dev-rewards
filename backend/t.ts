import { createPublicClient, createWalletClient, http } from "viem";
import { GOAT, GOAT_RPC } from "./goatChain";
import { abi } from "../ignition/deployments/chain-48816/artifacts/GOATDeveloperRewardsModule#GOATDeveloperRewards.json";
import dotenv from "dotenv";
import { privateKeyToAccount } from "viem/accounts";


dotenv.config();
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);

const publicClient = createPublicClient({ chain: GOAT, transport: http(GOAT_RPC) });
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS! as `0x${string}`;

async function t() {

  const gasEstimate = await publicClient.estimateContractGas({
    address: CONTRACT_ADDRESS, abi, functionName: "toggleSpeedrun", args: [true], account
  });
  console.log(gasEstimate)
  const {
    maxFeePerGas,
    maxPriorityFeePerGas
  } = await publicClient.estimateFeesPerGas();
  console.log(maxFeePerGas, maxPriorityFeePerGas)
 

  const totalFee = gasEstimate * maxFeePerGas;
  console.log(totalFee)
}

t();