import { useState } from "react"
import { useAccount, useWriteContract, usePublicClient } from "wagmi"
import { Droplets, CheckCircle, Loader, ExternalLink } from "lucide-react"
import { CONTRACTS } from "../lib/contracts"

const FAUCET_ABI = [
  {
    name: "faucet",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "faucetCooldownRemaining",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
]

export default function WethFaucet({ onSuccess }) {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  const [step, setStep] = useState("idle")
  const [txHash, setTxHash] = useState(null)
  const [cooldownHours, setCooldownHours] = useState(0)
  const [errorMsg, setErrorMsg] = useState("")

  async function handleClaim() {
    if (!address) return
    setStep("claiming")
    setErrorMsg("")

    try {
      /* Try to check cooldown — if it fails just proceed anyway */
      try {
        const remaining = await publicClient.readContract({
          address: CONTRACTS.MockWETH.address,
          abi: FAUCET_ABI,
          functionName: "faucetCooldownRemaining",
          args: [address],
        })

        if (Number(remaining) > 0) {
          const hours = Math.ceil(Number(remaining) / 3600)
          setCooldownHours(hours)
          setStep("cooldown")
          return
        }
      } catch {
        /* cooldown check failed — proceed to claim anyway */
      }

      /* Call faucet() */
      const hash = await writeContractAsync({
        address: CONTRACTS.MockWETH.address,
        abi: FAUCET_ABI,
        functionName: "faucet",
      })

      setTxHash(hash)
      await publicClient.waitForTransactionReceipt({ hash })
      setStep("done")
      if (onSuccess) onSuccess()

    } catch (err) {
      const msg = err?.message || ""
      if (msg.includes("User rejected") || msg.includes("user rejected")) {
        setErrorMsg("Transaction rejected.")
      } else if (msg.includes("cooldown") || msg.includes("Faucet cooldown")) {
        const hours = 24
        setCooldownHours(hours)
        setStep("cooldown")
      } else {
        setErrorMsg("Transaction failed. Check that you are on Arc Testnet.")
      }
      if (step !== "cooldown") setStep("error")
    }
  }

  function reset() {
    setStep("idle")
    setTxHash(null)
    setErrorMsg("")
  }

  if (!isConnected) return null

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "rgba(34,211,238,0.04)",
        border: "1px solid rgba(34,211,238,0.2)",
        borderRadius: "14px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
        boxSizing: "border-box",
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            backgroundColor: "rgba(34,211,238,0.1)",
            border: "1px solid rgba(34,211,238,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Droplets size={18} color="#22d3ee" />
        </div>
        <div>
          <p style={{ color: "white", fontSize: "14px", fontWeight: "600", marginBottom: "2px" }}>
            Need test WETH?
          </p>
          <p style={{ color: "#6b7280", fontSize: "12px" }}>
            Get 10 free WETH to use as collateral — one claim per 24 hours
          </p>
        </div>
      </div>

      {/* Right */}
      <div style={{ flexShrink: 0 }}>
        {step === "done" ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#4ade80", fontSize: "13px" }}>
              <CheckCircle size={16} />
              10 WETH received!
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
                padding: "4px 10px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.08)",
                backgroundColor: "transparent",
                color: "#6b7280",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>
        ) : step === "cooldown" ? (
          <div style={{ color: "#eab308", fontSize: "13px" }}>
            ⏳ Come back in {cooldownHours}h
          </div>
        ) : step === "error" ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#f87171", fontSize: "12px" }}>{errorMsg}</span>
            <button
              onClick={reset}
              style={{
                padding: "4px 10px",
                borderRadius: "8px",
                border: "1px solid rgba(239,68,68,0.2)",
                backgroundColor: "transparent",
                color: "#f87171",
                fontSize: "12px",
                cursor: "pointer",
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
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "10px",
              border: "1px solid rgba(34,211,238,0.3)",
              backgroundColor: "rgba(34,211,238,0.1)",
              color: "#22d3ee",
              fontSize: "14px",
              fontWeight: "500",
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
                Get 10 Free WETH
              </>
            )}
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
