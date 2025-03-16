import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const GOATDeveloperRewardsModule = buildModule("GOATDeveloperRewardsModule", (m) => {
  const contract = m.contract("GOATDeveloperRewards", []);

  return { contract };
});

export default GOATDeveloperRewardsModule;