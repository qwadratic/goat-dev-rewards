"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { readContract } from "wagmi/actions"
import { formatAddress } from "../lib/utils"
import { config } from "./wallet-provider"

// Replace with your actual NFT contract address
const NFT_CONTRACT_ADDRESS = "0xFcffDCCa48F717a29899e0Dec046D1f1034f3e99"

// Simple ABI for NFT contract
const NFT_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "tokensOfOwner",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
]

interface NFT {
  id: number;
  name: string;
  image: string;
}

export default function NFTDisplay() {
  const { address, isConnected } = useAccount()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState<number>(0)

  // Fetch balance when connected
  useEffect(() => {
    async function fetchBalance() {
      if (!isConnected || !address) return

      try {
        const result = await readContract(config, {
          address: NFT_CONTRACT_ADDRESS,
          abi: NFT_ABI,
          functionName: "balanceOf",
          args: [address],
        })

        setBalance(Number(result))
      } catch (error) {
        console.error("Error fetching balance:", error)
      }
    }

    fetchBalance()
  }, [address, isConnected])

  // Fetch NFTs when connected
  useEffect(() => {
    async function fetchNFTs() {
      if (!isConnected || !address) return

      setLoading(true)
      try {
        // This is a simplified example - in a real app, you'd need to:
        // 1. Get token IDs owned by the user (tokensOfOwner or similar)
        // 2. Fetch metadata for each token

        // Simulating NFT data for demonstration
        const mockNFTs = Array.from({ length: balance }, (_, i) => ({
          id: i + 1,
          name: `Terminal NFT #${i + 1}`,
          image: `/placeholder.svg?height=300&width=300`,
        }))

        setNfts(mockNFTs)
      } catch (error) {
        console.error("Error fetching NFTs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNFTs()
  }, [address, isConnected, balance])

  if (!isConnected) {
    return <div className="text-green-500/70">Connect your wallet to view your NFTs</div>
  }

  if (loading) {
    return <div className="text-green-500/70">Loading NFTs...</div>
  }

  if (nfts.length === 0) {
    return <div className="text-green-500/70">No NFTs found for this contract</div>
  }

  return (
    <div>
      <div className="mb-4 text-green-500/70">
        <span className="text-green-500">Contract:</span> {formatAddress(NFT_CONTRACT_ADDRESS)}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {nfts.map((nft) => (
          <div
            key={nft.id}
            className="border border-green-500/30 rounded-md p-3 hover:border-green-500 transition-colors"
          >
            <div className="aspect-square bg-black/50 mb-2 overflow-hidden rounded">
              <img src={nft.image || "/placeholder.svg"} alt={nft.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-green-500 font-bold">{nft.name}</div>
            <div className="text-green-500/70 text-sm">ID: {nft.id}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

