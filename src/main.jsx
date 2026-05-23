import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import "@rainbow-me/rainbowkit/styles.css"
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"

const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.quicknode.testnet.arc.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "ArcScan",
      url: "https://testnet.arcscan.app",
    },
  },
  testnet: true,
}

/* WalletConnect Project ID from environment variable — never hardcode */
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || ""

if (!projectId) {
  console.warn(
    "WalletConnect Project ID is not set. " +
    "Add VITE_WALLETCONNECT_PROJECT_ID to your .env file. " +
    "Get a free ID at https://cloud.walletconnect.com"
  )
}

const config = getDefaultConfig({
  appName: "Arc Lending",
  projectId,
  chains: [arcTestnet],
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
)
