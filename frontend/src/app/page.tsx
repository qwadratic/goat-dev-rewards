import { Suspense } from "react"
import NFTDisplay from "../components/nft-display"
import EventsTable from "../components/events-table"
import ContractState from "../components/contract-state"
import WalletProvider from "../components/wallet-provider"
import { Terminal } from "lucide-react"

export default function Home() {
  return (
    <WalletProvider>
      <main className="min-h-screen bg-black text-green-500 p-6 font-mono">
        <header className="flex items-center gap-2 mb-8 border-b border-green-500/30 pb-4">
          <Terminal className="h-6 w-6"/>
          <h1 className="text-2xl font-bold" style={{display: "inline-block"}}>GOAT Developer Rewards</h1>
        </header>

        <div className="grid gap-8">
          <section className="border border-green-500/30 rounded-md p-4">
            <h2 className="text-xl mb-4 flex items-center gap-2">
              <span className="text-green-500">$</span> NFT Collection
            </h2>
            <Suspense fallback={<div className="text-green-500/70">Loading NFTs...</div>}>
              <NFTDisplay />
            </Suspense>
          </section>

          <section className="border border-green-500/30 rounded-md p-4">
            <h2 className="text-xl mb-4 flex items-center gap-2">
              <span className="text-green-500">$</span> Contract Events
            </h2>
            <Suspense fallback={<div className="text-green-500/70">Loading events...</div>}>
              <EventsTable />
            </Suspense>
          </section>

          <section className="border border-green-500/30 rounded-md p-4">
            <h2 className="text-xl mb-4 flex items-center gap-2">
              <span className="text-green-500">$</span> Contract State
            </h2>
            <Suspense fallback={<div className="text-green-500/70">Loading state...</div>}>
              <ContractState />
            </Suspense>
          </section>
        </div>
      </main>
    </WalletProvider>
  )
}

