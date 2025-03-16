import { createPublicClient, http } from "viem";
import { GOAT, GOAT_RPC } from "./goatChain";
import { abi } from "../ignition/deployments/chain-48816/artifacts/GOATDeveloperRewardsModule#GOATDeveloperRewards.json";
import dotenv from "dotenv";


dotenv.config();

const publicClient = createPublicClient({ chain: GOAT, transport: http(GOAT_RPC) });
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;

async function t() {
  // const r = await publicClient.readContract({
  //   address: CONTRACT_ADDRESS as `0x${string}`,
  //   abi: abi,
  //   functionName: "contracts",
  //   args: ["0x2cB7e2A52F62b103A91b0Da0a9FA08C74823c381"]
  // });
  // console.log(r)

  const b = await publicClient.getBlock({
    includeTransactions: true,
    blockNumber: BigInt(2978252)
  });
  const receipt = await publicClient.getTransactionReceipt({ hash: b.transactions[0].hash });
  console.log(receipt)
}

t();