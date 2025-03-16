"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { useState } from "react"
import { formatAddress } from "../lib/utils"

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [isOpen, setIsOpen] = useState(false)

  if (!isConnected) {
    return (
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-500 text-black px-4 py-2 rounded font-mono hover:bg-green-600 transition-colors"
      >
        Connect Wallet
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-black border border-green-500/30 z-10">
            <div className="py-1">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => {
                    connect({ connector })
                    setIsOpen(false)
                  }}
                  disabled={!connector.ready || isPending}
                  className="w-full text-left px-4 py-2 text-green-500 hover:bg-green-900/20 transition-colors"
                >
                  {connector.name}
                  {!connector.ready && " (unsupported)"}
                  {isPending && " (connecting...)"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => disconnect()}
        className="bg-green-500 text-black px-3 py-1 rounded font-mono hover:bg-green-600 transition-colors"
      >
        {formatAddress(address || "")}
      </button>
    </div>
  )
}

