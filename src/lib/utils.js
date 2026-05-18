
// Format numbers for display
export function formatNumber(num, decimals = 2) {
  if (!num) return "0"
  const n = Number(num)
  if (n >= 1000000) return (n / 1000000).toFixed(decimals) + "M"
  if (n >= 1000) return (n / 1000).toFixed(decimals) + "K"
  return n.toFixed(decimals)
}

// Format USDC amount (6 decimals)
export function formatUSDC(amount) {
  if (!amount) return "0.00"
  return (Number(amount) / 1e6).toFixed(2)
}

// Format WETH amount (18 decimals)
export function formatWETH(amount) {
  if (!amount) return "0.0000"
  return (Number(amount) / 1e18).toFixed(4)
}

// Format percentage from WAD (1e18)
export function formatPercent(wadValue) {
  if (!wadValue) return "0.00%"
  return ((Number(wadValue) / 1e18) * 100).toFixed(2) + "%"
}

// Format health factor
export function formatHealthFactor(wadValue) {
  if (!wadValue) return "0.00"
  const hf = Number(wadValue) / 1e18
  if (hf === Number.MAX_SAFE_INTEGER) return "∞"
  if (hf > 1000) return "∞"
  return hf.toFixed(2)
}

// Get health factor color
export function getHealthColor(wadValue) {
  if (!wadValue) return "text-gray-400"
  const hf = Number(wadValue) / 1e18
  if (hf > 1.5) return "text-green-400"
  if (hf > 1.1) return "text-yellow-400"
  return "text-red-400"
}

// Get health factor background color
export function getHealthBgColor(wadValue) {
  if (!wadValue) return "bg-gray-400"
  const hf = Number(wadValue) / 1e18
  if (hf > 1.5) return "bg-green-400"
  if (hf > 1.1) return "bg-yellow-400"
  return "bg-red-400"
}

// Get health factor status text
export function getHealthStatus(wadValue) {
  if (!wadValue) return "No Position"
  const hf = Number(wadValue) / 1e18
  if (hf > 1.5) return "Safe"
  if (hf > 1.1) return "Warning"
  return "Danger"
}

// Parse USDC input to 6 decimal bigint
export function parseUSDC(amount) {
  if (!amount) return 0n
  return BigInt(Math.floor(parseFloat(amount) * 1e6))
}

// Parse WETH input to 18 decimal bigint
export function parseWETH(amount) {
  if (!amount) return 0n
  return BigInt(Math.floor(parseFloat(amount) * 1e18))
}

// Shorten address
export function shortenAddress(address) {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Format transaction hash
export function shortenHash(hash) {
  if (!hash) return ""
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`
}