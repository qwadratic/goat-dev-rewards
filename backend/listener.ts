import { createPublicClient, http } from "viem";
import { saveBlockGasData, getSpeedrunStatus } from "./storage";
import { recordDeployment, recordInteraction } from "./handlers";
import { GOAT, GOAT_RPC } from "./goatChain";
import dotenv from "dotenv";


dotenv.config();

const publicClient = createPublicClient({ chain: GOAT, transport: http(GOAT_RPC) });


export function initEventListener() {
  console.log("Starting event listener...");

  // Listen for new blocks
  publicClient.watchBlockNumber({
    onBlockNumber: async (blockNumber) => {
      console.log(`🔍 Checking block ${blockNumber} ...`);
      const block = await publicClient.getBlock({ blockNumber, includeTransactions: true });

      if (block?.transactions) {
        let gasData: Map<string, { contract: string; feeSpent: bigint }> = new Map();

        for (const tx of block.transactions) {
          if (tx.to) {
            // Detect contract deployments
            const receipt = await publicClient.getTransactionReceipt({ hash: tx.hash });
            if (receipt.contractAddress) {
              console.log(`🚀 New contract deployed: ${receipt.contractAddress} by ${tx.from}`);
              await recordDeployment(receipt.contractAddress, tx.from);
            }

            // Track interactions
            const key = `${tx.from}-${tx.to}`;
            const gasSpent = receipt.gasUsed;
            const feeSpent = receipt.gasUsed * receipt.effectiveGasPrice
            if (!gasData.has(key)) {
              gasData.set(key, { contract: tx.to, feeSpent });
            } else {
              gasData.get(key)!.feeSpent += feeSpent;
            }
          }
          // tx.to == null
          else {
            const receipt = await publicClient.getTransactionReceipt({ hash: tx.hash });
            if (receipt.contractAddress) {
              console.log(`🚀 New contract deployed: ${receipt.contractAddress} by ${tx.from}`);
              await recordDeployment(receipt.contractAddress, tx.from);
            }
          }
        }

        // Process the collected interactions
        for (const [key, { contract, feeSpent }] of gasData.entries()) {
          const [user] = key.split("-");
          const isSpeedrun = await getSpeedrunStatus();

          if (isSpeedrun) {
            console.log(`⚡ Speedrun mode active! Calling recordInteraction for ${user} -> ${contract}`);
            await recordInteraction(contract, user, feeSpent);
          } else {
            console.log(`⏳ Speedrun off. Storing interaction for later processing.`);
            await saveBlockGasData(blockNumber, contract, user, feeSpent);
          }
        }
      }
    },
  });

  console.log("Event listener started.");
}



