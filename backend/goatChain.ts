export const GOAT_RPC = "https://rpc.testnet3.goat.network";

export const GOAT = {
  id: 48816,
  name: 'GOAT Testnet',
  network: 'goat-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'GOAT',
    symbol: 'GOAT',
  },
  rpcUrls: {
    default: { http: [GOAT_RPC] },
    public: { http: [GOAT_RPC] },
  },
} as const;
