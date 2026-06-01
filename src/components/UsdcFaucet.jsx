import { useState, useEffect } from "react"
import { useAccount, usePublicClient, useWriteContract } from "wagmi"
import { Droplets, CheckCircle, Loader, ExternalLink } from "lucide-react"
import { CONTRACTS } from "../lib/contracts"

const MINT_ABI = [
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to",     type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
]

// 3 days in milliseconds
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000
// 2,000 USDC with 6 decimals
const MINT_AMOUNT = 2000000000n

// Store last claim time per address in localStorage
function getLastClaim(address) {
  try {
    const stored = localStorage.getItem(`usdc_faucet_${address}`)
    return stored ? parseInt(stored) : 0
  } catch {
    return 0
  }
}

function setLastClaim(address) {
  try {
    localStorage.setItem(`usdc_faucet_${address}`, Date.now().toString())
  } catch {}
}

function formatCountdown(ms) {
  if (ms <= 0) return null
  const totalSeconds = Math.floor(ms / 1000)
  const days    = Math.floor(totalSeconds / 86400)
  const hours   = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  return `${minutes}m ${seconds}s`
}

export default function UsdcFaucet({ onSuccess }) {
  const { address, isConnected } = useAccount()
  const publicClient             = usePublicClient()
  const { writeContractAsync }   = useWriteContract()

  const [step, setStep]           = useState("idle")
  const [txHash, setTxHash]       = useState(null)
  const [errorMsg, setErrorMsg]   = useState("")
  const [countdown, setCountdown] = useState(null)

  // Check and update countdown every second
  useEffect(() => {
    if (!address) return

    function tick() {
      const lastClaim  = getLastClaim(address)
      const elapsed    = Date.now() - lastClaim
      const remaining  = COOLDOWN_MS - elapsed

      if (remaining > 0) {
        setCountdown(formatCountdown(remaining))
        setStep("cooldown")
      } else {
        setCountdown(null)
        if (step === "cooldown") setStep("idle")
      }
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [address, step])

  async function handleClaim() {
    if (!address) return

    // Check cooldown
    const lastClaim = getLastClaim(address)
    const remaining = COOLDOWN_MS - (Date.now() - lastClaim)
    if (remaining > 0) {
      setStep("cooldown")
      return
    }

    setStep("claiming")
    setErrorMsg("")

    try {
      const hash = await writeContractAsync({
        address: CONTRACTS.MockUSDC.address,
        abi: MINT_ABI,
        functionName: "mint",
        args: [address, MINT_AMOUNT],
      })

      setTxHash(hash)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      if (receipt.status === "reverted") {
        throw new Error("Transaction failed onchain")
      }

      // Save claim time
      setLastClaim(address)
      setStep("done")
      if (onSuccess) onSuccess()

    } catch (err) {
      const msg = err?.message || ""
      if (msg.includes("User rejected") || msg.includes("user rejected")) {
        setErrorMsg("Transaction rejected.")
      } else {
        setErrorMsg("Claim failed. Make sure you are on Arc Testnet.")
      }
      setStep("error")
    }
  }

  function reset() {
    setStep("idle")
    setTxHash(null)
    setErrorMsg("")
  }

  if (!isConnected) return null

  return (
    <div style={{
      width: "100%",
      backgroundColor: "rgba(74,222,128,0.04)",
      border: "1px solid rgba(74,222,128,0.2)",
      borderRadius: "14px",
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
      flexWrap: "wrap",
      boxSizing: "border-box",
    }}>

      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px",
          backgroundColor: "rgba(74,222,128,0.1)",
          border: "1px solid rgba(74,222,128,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Droplets size={18} color="#4ade80" />
        </div>
        <div>
          <p style={{ color: "white", fontSize: "14px", fontWeight: "600", marginBottom: "2px" }}>
            Need test USDC?
          </p>
          <p style={{ color: "#6b7280", fontSize: "12px" }}>
            Get 2,000 free USDC to supply — one claim per 3 days
          </p>
        </div>
      </div>

      {/* Right */}
      <div style={{ flexShrink: 0 }}>
        {step === "done" ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#4ade80", fontSize: "13px" }}>
              <CheckCircle size={16} />
              2,000 USDC received!
            </div>
            {txHash && (
              <a
                href={`https://testnet.arcscan.app/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#6b7280" }}
              >
                <ExternalLink size={13} />
              </a>
            )}
            <button
              onClick={reset}
              style={{
                padding: "4px 10px", borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.08)",
                backgroundColor: "transparent", color: "#6b7280",
                fontSize: "12px", cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>

        ) : step === "cooldown" ? (
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            color: "#eab308", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace",
          }}>
            ⏳ {countdown || "Calculating..."}
          </div>

        ) : step === "error" ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#f87171", fontSize: "12px" }}>{errorMsg}</span>
            <button
              onClick={reset}
              style={{
                padding: "4px 10px", borderRadius: "8px",
                border: "1px solid rgba(239,68,68,0.2)",
                backgroundColor: "transparent", color: "#f87171",
                fontSize: "12px", cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>

        ) : (
          <button
            onClick={handleClaim}
            disabled={step === "claiming"}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 20px", borderRadius: "10px",
              border: "1px solid rgba(74,222,128,0.3)",
              backgroundColor: "rgba(74,222,128,0.1)",
              color: "#4ade80", fontSize: "14px", fontWeight: "500",
              cursor: step === "idle" ? "pointer" : "not-allowed",
              opacity: step === "idle" ? 1 : 0.7,
            }}
          >
            {step === "claiming" ? (
              <>
                <Loader size={14} style={{ animation: "spin 1s linear infinite" }} />
                Claiming...
              </>
            ) : (
              <>
                <Droplets size={14} />
                Get 2,000 Free USDC
              </>
            )}
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
