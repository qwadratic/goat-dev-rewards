"use client"

import type React from "react"
import { WagmiConfig, createConfig } from "wagmi"
import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { defineChain, http, createWalletClient } from "viem"
import { ConnectWallet } from "./connect-wallet"


const goatTestnet = defineChain({
  id: 48816,
  name: "GOAT Testnet3",
  network: "goat-testnet3",
  nativeCurrency: {
    decimals: 18,
    name: "tBTC",
    symbol: "tBTC",
  },
  rpcUrls: {
    default: { http: ["https://rpc.testnet3.goat.network"] },
    public: { http: ["https://rpc.testnet3.goat.network"] },
  },
});

// Create wagmi config using v2 API
const { wallets } = getDefaultWallets({
  appName: 'GOAT Demo',
  projectId: 'c288a645dc538f0298c50d0f1cc55a79', // Get this from WalletConnect Cloud
  // chains: [goatTestnet]
});

export const config = createConfig({
  chains: [goatTestnet],
  transports: {
    [goatTestnet.id]: http(),
  },
  ssr: true
});

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration errors by only rendering on client
  useEffect(() => setMounted(true), [])

  const queryClient = new QueryClient()

  return mounted ? (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="flex justify-end mb-6">
          <ConnectWallet />
        </div>
        {children}
      </QueryClientProvider>
    </WagmiConfig>
  ) : null
}

