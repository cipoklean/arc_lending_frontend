import { AppKit } from "@circle-fin/app-kit"
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2"

let kitInstance = null

export async function getAppKit() {
  if (kitInstance) return kitInstance
  kitInstance = new AppKit()
  return kitInstance
}

export async function getViemAdapter() {
  if (!window.ethereum) throw new Error("No wallet found")
  const adapter = await createViemAdapterFromProvider({
    provider: window.ethereum,
  })
  return adapter
}