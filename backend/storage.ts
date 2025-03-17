import { createClient } from "redis";
import { createPublicClient, http } from "viem";
import dotenv from "dotenv";
import { abi } from "./abi";
import { GOAT, GOAT_RPC } from "./goatChain";

dotenv.config();
const redis = createClient();
redis.connect();

const publicClient = createPublicClient({ chain: GOAT, transport: http(GOAT_RPC) });

export async function saveBlockGasData(block: bigint, contract: string, user: string, gasSpent: bigint) {
  const key = `contract:${contract}:user:${user}:block:${block}`;
  await redis.hIncrBy(key, "gasSpent", Number(gasSpent));
}

export async function getAggregatedGasData(): Promise<Map<string, bigint>> {
  // Keys sorted by blockNumber asc
  const keys = (await redis.keys("contract:*:user:*:block:*")).sort((a, b) => {
    const blockA = parseInt(a.split(":").pop()!);
    const blockB = parseInt(b.split(":").pop()!);
    return blockA - blockB;
  });
  let results: Map<string, bigint> = new Map();

  for (const key of keys) {
    const gasSpent = await redis.hGet(key, "gasSpent");
    const [_, contract, __, user] = key.split(":");
    if (gasSpent) {
      const mapKey = `${contract}:${user}`;
      if (results.has(mapKey)) {
        results.set(mapKey, results.get(mapKey)! + BigInt(gasSpent));
      } else {
        results.set(mapKey, BigInt(gasSpent));
      }
    }
  }
  return results;
}

export async function clearGasData(contract: string, user: string) {
  const keyPattern = `contract:${contract}:user:${user}:block:*`;
  const keys = await redis.keys(keyPattern);
  for (const key of keys) {
    await redis.del(key);
  }
}

export async function getSpeedrunStatus(): Promise<boolean> {
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
  try {
    const status = await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: abi,
      functionName: "speedrunActive",
    });
    console.log(`🏁 Speedrun status: ${status}`);
    return status as boolean;
  } catch (err) {
    console.error("❌ Failed to fetch Speedrun status:", err);
    return false;
  }
}
