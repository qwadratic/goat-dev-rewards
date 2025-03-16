# **Technical Documentation: GOAT NFT Rewards System**

## **Table of Contents**

- [**Technical Documentation: GOAT NFT Rewards System**](#technical-documentation-goat-nft-rewards-system)
  - [**Table of Contents**](#table-of-contents)
  - [**Overview**](#overview)
  - [**Smart Contract**](#smart-contract)
    - [**Contract: `GOATDeveloperRewards`**](#contract-goatdeveloperrewards)
    - [**Key Features**](#key-features)
    - [**Events**](#events)
  - [**Backend**](#backend)
    - [**Architecture \& Components**](#architecture--components)
    - [**Server (`server.ts`)**](#server-serverts)
    - [**Event Listener (`listener.ts`)**](#event-listener-listenerts)
    - [**Handlers (`handlers.ts`)**](#handlers-handlersts)
    - [**Data Storage (`storage.ts`)**](#data-storage-storagets)
    - [**Batch Processing (`scheduler.ts`)**](#batch-processing-schedulerts)
  - [**Frontend**](#frontend)
    - [Core Features](#core-features)
      - [User Dashboard (Main Page)](#user-dashboard-main-page)
      - [Leaderboard Page](#leaderboard-page)
      - [Speedrun Page](#speedrun-page)
      - [Contract Explorer Page](#contract-explorer-page)
      - [Admin Panel (For DevRel Team)](#admin-panel-for-devrel-team)
  - [**Deployment Instructions**](#deployment-instructions)
    - [**Smart Contract Deployment**](#smart-contract-deployment)
    - [**Backend Setup**](#backend-setup)
    - [**Frontend**](#frontend-1)
  - [**Fee estimation**](#fee-estimation)
  - [**DevRel Strategy**](#devrel-strategy)



## **Overview**
The GOAT NFT Rewards System incentivizes developers by issuing NFT-based achievements when specific on-chain milestones are met. The system consists of:
- **Smart Contract** (Solidity, Viem) – Tracks contract deployments and user interactions, issues NFT rewards.
- **Backend Service** (Node.js, Viem, Express) – Listens to blockchain events, aggregates data, and interacts with the smart contract.
- **Frontend** (Next.js, Wagmi, Viem) - Basic functionality: mint history, my NFTs and Speedrun status

---

## **Smart Contract**

### **Contract: `GOATDeveloperRewards`**

### **Key Features**
- **First Deployment Badge** – Awarded to the first-time contract deployers.
- **10 Unique Users Badge** – Awarded when a contract reaches 10 unique interacting EOAs.
- **Gas Spent Badge** – Given when users spend a predefined amount of gas interacting with a contract.
- **Speedrun Mode** – A competition where the first contract to reach a milestone while Speedrun is active wins a rare NFT.

**Functions**

`toggleSpeedrun(bool isActive) external onlyOwner`
- Enables/disables Speedrun mode.

`recordDeployment(address contractAddress, address deployer) external onlyOwner`
- Stores contract deployment details and issues badges for first-time deployers.

`recordInteraction(address contractAddress, address user, uint256 gasSpent) external onlyOwner`
- Logs user interactions with a contract, tracks gas consumption, and assigns milestone rewards.
- If Speedrun mode is active, the first contract to hit the milestone wins instantly.

`_mintBadge(address to, string memory badgeType) internal`
- Mints a new NFT badge and emits an event.

### **Events**
- `BadgeAwarded(address indexed recipient, string badgeType)` – Triggered when an NFT is issued.
- `SpeedrunWinner(address indexed contractAddress, address indexed deployer, uint256 timestamp)` – Fired when a Speedrun challenge is won.

---

## **Backend**

### **Architecture & Components**
- **`server.ts`** – Initializes and runs the backend, starts the event listener and scheduler.
- **`listener.ts`** – Monitors blockchain events and processes contract deployments and interactions.
- **`scheduler.ts`** – Manages scheduled updates (calls `recordInteraction()` every hour for stored data).
- **`storage.ts`** – Handles Redis-based caching for efficient tracking of interactions and gas usage.
- **`handlers.ts`** – Contains logic for processing interactions and submitting on-chain transactions.
- **`goatChain.ts`** – GOAT Testnet3 configs for Viem.

### **Server (`server.ts`)**
- Sets up an Express-based API.
- Initializes event listeners (`listener.ts`) and scheduled updates (`scheduler.ts`).
- Runs on port specified in `.env` (default: `3000`).

### **Event Listener (`listener.ts`)**

**Functionality**
- Listens to **all new blocks** and processes contract deployments & user interactions.
- Calls `recordDeployment()` whenever a new contract is detected.
- Collects `(user, contract, gasSpent)` tuples from interactions.
- Aggregates total `gasSpent` per `(user, contract)`.
- **Fetches `speedrunActive` from the smart contract** before processing interactions.
- If Speedrun is active → Calls `recordInteraction()` immediately.
- If Speedrun is inactive → Stores interaction data for batch updates.

### **Handlers (`handlers.ts`)**

Includes functions to record contract deployments and user interactions on-chain. These functions are called by the event listener when new blocks are processed, ensuring that all relevant blockchain events are captured and logged appropriately. 

**Functions**

`recordDeployment(contractAddress: string, deployer: string)`
- Calls `recordDeployment()` on the contract.

`recordInteraction(contract: string, user: string, gasSpent: bigint)`
- Calls `recordInteraction()` with the aggregated data.


### **Data Storage (`storage.ts`)**

Stores:
- **Aggregated user interactions** (if Speedrun is inactive)
- **Tracking gas usage per contract per user**

**Functions**

`saveBlockGasData(block: number, contract: string, user: string, gasSpent: bigint)`
- Stores interaction data (contract, user, feeSpent) in Redis.

`getAggregatedGasData(): Promise<Array<{ contract: string; user: string; gasSpent: number }>>`
- Fetches stored gas data for hourly batch processing.

`clearGasData(contract: string, user: string)`
- Clears stored gas data after submitting interactions to the smart contract.

`getSpeedrunStatus(): Promise<boolean>`
- Reads the `speedrunActive` state from the smart contract.
---

### **Batch Processing (`scheduler.ts`)**

**Functionality**
- Runs **hourly** to process stored interactions.
- Calls `recordInteraction()` for contracts with stored data.
- Clears stored records after processing.

---

## **Frontend**

The frontend provides an interactive dashboard where developers can track their achievements, participate in Speedruns, and view leaderboards. 

### Core Features

#### User Dashboard (Main Page)

- ✅ Connect Wallet (GOAT Testnet3)
- ✅ Show Earned Badges (NFTs)
- ⏳ Track Milestone Progress (e.g., “7/10 unique users reached”)
- ✅ See Speedrun Status (Active or Ended)
- ✅ Show badge mint history
- ⏳ Gas Usage Overview for Deployed Contracts

#### Leaderboard Page

- ⏳ Show Top Developers by NFTs Earned
- ⏳ Highlight Recent Speedrun Winners
- ⏳ Show Total Contract Interactions & Gas Spent

#### Speedrun Page

- ⏳ List Ongoing Speedrun Challenges
- ⏳ Real-Time Status Updates
- ⏳ Countdown Timer Until Speedrun Ends
- ⏳ Live Updates on Who’s in the Lead

#### Contract Explorer Page

- ⏳ List of All Participating Smart Contracts
- ⏳ Track Unique User Interactions Per Contract
- ⏳ Gas Spent Per Contract
- ⏳ Direct Link to Verify on Block Explorer

#### Admin Panel (For DevRel Team)

- ⏳ Manually Toggle Speedrun Mode
- ⏳ Review & Approve Special Challenge NFTs
- ⏳ Monitor Developer Engagement Metrics

## **Deployment Instructions**

### **Smart Contract Deployment**
1. Ensure dependencies are installed:
   ```bash
   npm install
   ```
2. Compile and deploy the contract:
   ```bash
   npx hardhat compile
   npx hardhat ignition deploy ./ignition/modules/GOATDeveloperRewards.ts --network goat
   ```

### **Backend Setup**
1. Go to backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Set environment variables in `.env`:
   ```
   PORT=3000
   CONTRACT_ADDRESS=0xYourContractAddress
   PRIVATE_KEY=0xYourPrivateKey
   ```
3. Start Redis:
   ```bash
   docker run --name goat-redis -d -p 6379:6379 redis
   ```
4. Start the backend:
   ```bash
   npx ts-node server.ts
   ```

### **Frontend**

1. Go to frontend directory and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Run the frontend app locally:
   ```bash
   npm run dev
   ```

## **Fee estimation**

To estimate fees for smart contract calls, follow the approach described in GOAT docs [Fee Estimation article](https://docs.goat.network/builders/app-developers/transactions/estimating).

Specifically, in Viem library, it should be done in a following way:

```typescript
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);

const publicClient = createPublicClient({ chain: GOAT, transport: http(GOAT_RPC) });
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS! as `0x${string}`;

const gasEstimate = await publicClient.estimateContractGas({
  address: CONTRACT_ADDRESS, 
  abi, 
  functionName: "toggleSpeedrun", 
  args: [true], 
  account
});
const {
  maxFeePerGas,
  maxPriorityFeePerGas
} = await publicClient.estimateFeesPerGas();

const totalFee = gasEstimate * maxFeePerGas;
console.log(totalFee);
```

## **DevRel Strategy**

See [Strategy Document](Strategy.md)