"use client"

import { useState, useEffect } from "react"
import { useAccount, usePublicClient } from "wagmi"
import { formatAddress, formatDate } from "../lib/utils"
import { config } from "./wallet-provider"
import { watchContractEvent } from "wagmi/actions"
import { parseAbiItem } from "viem"

const CONTRACT_ADDRESS = "0xFcffDCCa48F717a29899e0Dec046D1f1034f3e99"

// ABI for the BadgeAwarded event
const EVENT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "badgeType",
        type: "string",
      },
    ],
    name: "BadgeAwarded",
    type: "event",
  },
]

interface Event {
  recipient: string;
  badgeType: string;
  blockNumber: bigint | null;
  transactionHash: `0x${string}` | null;
  timestamp: number;
}

export default function EventsTable() {
  const { isConnected } = useAccount()
  const publicClient = usePublicClient()
  const [events, setEvents] = useState<Event[]>([])

  // Set up event listener
  // useEffect(() => {
  //   if (!isConnected || !publicClient) return

  //   // Set up event watcher
  //   const unwatch = watchContractEvent(config, {
  //     address: CONTRACT_ADDRESS,
  //     abi: EVENT_ABI,
  //     eventName: "BadgeAwarded",
  //     onLogs(logs) {
  //       logs.forEach((log) => {
  //         const { args, blockNumber, transactionHash } = log

  //         setEvents((prev) =>
  //           [
  //             {
  //               recipient: args.recipient,
  //               badgeType: args.badgeType,
  //               blockNumber,
  //               transactionHash,
  //               timestamp: Date.now(), // In a real app, you'd get the block timestamp
  //             },
  //             ...prev,
  //           ].slice(0, 10),
  //         ) // Keep only the 10 most recent events
  //       })
  //     },
  //   })

  //   // Clean up the event listener
  //   return () => {
  //     unwatch()
  //   }
  // }, [isConnected, publicClient])

  // Fetch past events on component mount
  useEffect(() => {
    async function fetchPastEvents() {
      if (!isConnected || !publicClient) return

      try {
        const logs = await publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          event: parseAbiItem('event BadgeAwarded(address indexed recipient, string badgeType)'),
          fromBlock: BigInt(0),
        })
        setEvents(await Promise.all(logs.map(async (e) => {
          return {
            recipient: e.args.recipient!,
            badgeType: e.args.badgeType!,
            transactionHash: e.transactionHash,
            blockNumber: e.blockNumber,
            timestamp: Number((await publicClient.getBlock({blockNumber: e.blockNumber})).timestamp)
          }
        })));
      } catch (error) {
        console.error("Error fetching past events:", error)
      }
    }

    fetchPastEvents()
  }, [isConnected, publicClient])

  if (!isConnected) {
    return <div className="text-green-500/70">Connect your wallet to view events</div>
  }

  if (events.length === 0) {
    return <div className="text-green-500/70">No events found</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-green-500/30">
            <th className="text-left py-2 px-4 text-green-500">Recipient</th>
            <th className="text-left py-2 px-4 text-green-500">Badge Type</th>
            <th className="text-left py-2 px-4 text-green-500">Block</th>
            <th className="text-left py-2 px-4 text-green-500">Time</th>
            <th className="text-left py-2 px-4 text-green-500">Tx Hash</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <tr key={index} className="border-b border-green-500/10 hover:bg-green-900/10">
              <td className="py-2 px-4">{formatAddress(event.recipient)}</td>
              <td className="py-2 px-4">{event.badgeType}</td>
              <td className="py-2 px-4">{event.blockNumber}</td>
              <td className="py-2 px-4">{formatDate(event.timestamp)}</td>
              <td className="py-2 px-4">
                <a
                  href={`https://etherscan.io/tx/${event.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 hover:underline"
                >
                  {formatAddress(event.transactionHash as `0x${string}`)}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

