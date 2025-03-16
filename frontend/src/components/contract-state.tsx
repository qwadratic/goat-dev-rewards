"use client"

import { useAccount } from "wagmi"
import { readContract } from "wagmi/actions"
import { useState, useEffect } from "react"
import { config } from "./wallet-provider"

const CONTRACT_ADDRESS = "0xFcffDCCa48F717a29899e0Dec046D1f1034f3e99"

// ABI for the speedrunActive function
const CONTRACT_ABI = [
  {
    inputs: [],
    name: "speedrunActive",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
]

export default function ContractState() {
  const { isConnected } = useAccount()
  const [isSpeedrunActive, setIsSpeedrunActive] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  // Read the speedrun state from the contract
  useEffect(() => {
    async function fetchContractState() {
      if (!isConnected) return

      setIsLoading(true)
      setIsError(false)

      try {
        const result = await readContract(config, {
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "isSpeedrunActive",
          args: []
        })

        setIsSpeedrunActive(result as boolean)
      } catch (error) {
        console.error("Error reading contract state:", error)
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContractState()
  }, [isConnected])

  if (!isConnected) {
    return <div className="text-green-500/70">Connect your wallet to view contract state</div>
  }

  if (isLoading) {
    return <div className="text-green-500/70">Loading state...</div>
  }

  if (isError) {
    return <div className="text-red-500">Error loading contract state</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="text-green-500">Speedrun Enabled:</div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isSpeedrunActive ? "bg-green-500" : "bg-red-500"}`}></div>
          <span>{isSpeedrunActive ? "Active" : "Inactive"}</span>
        </div>
      </div>

      <div className="font-mono bg-black/50 p-3 rounded border border-green-500/30">
        <pre className="text-green-500">
          {`{
  "isSpeedrunActive": ${isSpeedrunActive ? "true" : "false"}
}`}
        </pre>
      </div>
    </div>
  )
}

