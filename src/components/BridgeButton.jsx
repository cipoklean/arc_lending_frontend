import { useState } from "react"
import ReactDOM from "react-dom"
import { getAppKit, getViemAdapter } from "../lib/appKit"
import { ArrowLeftRight } from "lucide-react"

export default function BridgeButton({ onSuccess }) {
  const [isLoading, setIsLoading]   = useState(false)
  const [amount, setAmount]         = useState("")
  const [fromChain, setFromChain]   = useState("Ethereum_Sepolia")
  const [error, setError]           = useState(null)
  const [success, setSuccess]       = useState(null)
  const [showModal, setShowModal]   = useState(false)

  const chains = [
    { id: "Ethereum_Sepolia",  label: "Ethereum Sepolia"  },
    { id: "Base_Sepolia",      label: "Base Sepolia"      },
    { id: "Arbitrum_Sepolia",  label: "Arbitrum Sepolia"  },
    { id: "Avalanche_Fuji",    label: "Avalanche Fuji"    },
  ]

  async function handleBridge() {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Enter a valid amount")
      return
    }
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const kit         = await getAppKit()
      const viemAdapter = await getViemAdapter()
      await kit.bridge({
        from: { adapter: viemAdapter, chain: fromChain },
        to:   { adapter: viemAdapter, chain: "Arc_Testnet" },
        amount,
      })
      setSuccess(`Successfully bridged ${amount} USDC to Arc Testnet!`)
      setAmount("")
      setShowModal(false)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err?.message || "Bridge failed — please try again")
    } finally {
      setIsLoading(false)
    }
  }

  const modal = (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{
        background: "#0D1117",
        border: "1px solid rgba(0,255,133,0.2)",
        borderRadius: 20,
        padding: 32,
        width: "100%",
        maxWidth: 440,
        margin: "0 16px",
        position: "relative",
      }}>

        {/* Close button */}
        <button
          onClick={() => setShowModal(false)}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "transparent", border: "none",
            color: "#6B7A8D", cursor: "pointer", fontSize: "1.2rem",
          }}
        >✕</button>

        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <ArrowLeftRight size={20} color="#00FF85" />
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.3rem", color: "white", margin: 0 }}>
            Bridge USDC to Arc
          </h2>
        </div>
        <p style={{ color: "#6B7A8D", fontSize: "0.85rem", marginBottom: 24 }}>
          Powered by Circle CCTP — move USDC from any chain to Arc Testnet instantly.
        </p>

        {/* From Chain */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: "#9CA3AF", fontSize: "0.8rem", display: "block", marginBottom: 8 }}>
            From Chain
          </label>
          <select
            value={fromChain}
            onChange={e => setFromChain(e.target.value)}
            style={{
              width: "100%", padding: "12px 16px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12, color: "white",
              fontSize: "0.9rem", outline: "none",
              boxSizing: "border-box",
            }}
          >
            {chains.map(c => (
              <option key={c.id} value={c.id} style={{ background: "#0D1117" }}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: "#9CA3AF", fontSize: "0.8rem", display: "block", marginBottom: 8 }}>
            Amount (USDC)
          </label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            style={{
              width: "100%", padding: "12px 16px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12, color: "white",
              fontSize: "1rem", outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* To chain indicator */}
        <div style={{
          background: "rgba(0,255,133,0.05)",
          border: "1px solid rgba(0,255,133,0.1)",
          borderRadius: 10, padding: "10px 14px",
          marginBottom: 20, fontSize: "0.8rem", color: "#6B7A8D"
        }}>
          → To: <span style={{ color: "#00FF85", fontWeight: 600 }}>Arc Testnet</span>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(255,77,109,0.1)",
            border: "1px solid rgba(255,77,109,0.3)",
            borderRadius: 10, padding: "10px 14px",
            color: "#FF4D6D", fontSize: "0.82rem", marginBottom: 16
          }}>⚠️ {error}</div>
        )}

        {/* Success */}
        {success && (
          <div style={{
            background: "rgba(0,255,133,0.1)",
            border: "1px solid rgba(0,255,133,0.3)",
            borderRadius: 10, padding: "10px 14px",
            color: "#00FF85", fontSize: "0.82rem", marginBottom: 16
          }}>✅ {success}</div>
        )}

        {/* Bridge button */}
        <button
          onClick={handleBridge}
          disabled={isLoading}
          style={{
            width: "100%", padding: "14px",
            background: isLoading ? "rgba(0,255,133,0.1)" : "rgba(0,255,133,0.15)",
            border: "1px solid rgba(0,255,133,0.3)",
            borderRadius: 12, color: "#00FF85",
            fontSize: "0.95rem", fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {isLoading ? "Bridging..." : "Bridge USDC"}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(0,255,133,0.08)",
          border: "1px solid rgba(0,255,133,0.25)",
          borderRadius: "999px",
          color: "#00FF85",
          fontSize: "0.8rem",
          fontWeight: 600,
          padding: "6px 14px",
          cursor: "pointer",
          transition: "all 0.2s ease",
          whiteSpace: "nowrap",
        }}
      >
        <ArrowLeftRight size={13} />
        Bridge USDC to Arc
      </button>

      {/* Portal — renders directly into document.body */}
      {showModal && ReactDOM.createPortal(modal, document.body)}
    </>
  )
}
