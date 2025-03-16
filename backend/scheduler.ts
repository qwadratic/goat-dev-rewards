import cron from "node-cron";
import { getAggregatedGasData, clearGasData } from "./storage";
import { recordInteraction } from "./handlers";

export function scheduleHourlyUpdate() {
  console.log("⏳ Scheduling hourly milestone check...");

  cron.schedule("0 * * * *", async () => {
    console.log("🔄 Running hourly interaction update...");

    const interactions = await getAggregatedGasData();
    for (const [key, gasSpent] of interactions.entries()) {
      const [contract, user] = key.split(":");
      await recordInteraction(contract, user, gasSpent as bigint);
      await clearGasData(contract, user); // Clear stored gas data after submitting
    }
  });
}