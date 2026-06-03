import { useState } from "react"
import ReactDOM from "react-dom"
import { getAppKit, getViemAdapter } from "../lib/appKit"
import { ArrowLeftRight, Info } from "lucide-react"

export default function BridgeButton({ onSuccess }) {
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount]       = useState("")
  const [fromChain, setFromChain] = useState("Ethereum_Sepolia")
  const [error, setError]         = useState(null)
  const [success, setSuccess]     = useState(null)
  const [showModal, setShowModal] = useState(false)

  const chains = [
    { id: "Ethereum_Sepolia", label: "Ethereum Sepolia" },
    { id: "Base_Sepolia",     label: "Base Sepolia"     },
    { id: "Arbitrum_Sepolia", label: "Arbitrum Sepolia" },
    { id: "Avalanche_Fuji",   label: "Avalanche Fuji"   },
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
      const msg = err?.message || ""
      // Give helpful error based on what went wrong
      if (msg.includes("CORS") || msg.includes("fetch") || msg.includes("network")) {
        setError("Network error — this feature requires a live domain. Works on arc-lending-frontend.vercel.app")
      } else if (msg.includes("allowance") || msg.includes("approve")) {
        setError("Insufficient allowance on source chain — approve USDC spending first on the source network")
      } else if (msg.includes("balance") || msg.includes("funds")) {
        setError(`Insufficient USDC on ${chains.find(c => c.id === fromChain)?.label} — get testnet USDC from a faucet on that chain first`)
      } else if (msg.includes("rejected") || msg.includes("denied")) {
        setError("Transaction rejected in wallet")
      } else {
        setError("Bridge failed — make sure you have USDC on the source chain and are connected to Arc Testnet")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const modal = (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{
        background: "#0D1117",
        border: "1px solid rgba(0,255,133,0.2)",
        borderRadius: 20, padding: 32,
        width: "100%", maxWidth: 460,
        margin: "0 16px", position: "relative",
      }}>
        <button
          onClick={() => setShowModal(false)}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "transparent", border: "none",
            color: "#6B7A8D", cursor: "pointer", fontSize: "1.2rem",
          }}
        >✕</button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <ArrowLeftRight size={20} color="#00FF85" />
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.3rem", color: "white", margin: 0 }}>
            Bridge USDC to Arc
          </h2>
        </div>
        <p style={{ color: "#6B7A8D", fontSize: "0.85rem", marginBottom: 16 }}>
          Powered by Circle CCTP — move USDC from any testnet chain to Arc Testnet.
        </p>

        {/* Requirements notice */}
        <div style={{
          background: "rgba(0,212,255,0.05)",
          border: "1px solid rgba(0,212,255,0.15)",
          borderRadius: 10, padding: "12px 14px",
          marginBottom: 20,
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <Info size={14} color="#00D4FF" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ color: "#00D4FF", fontSize: "0.78rem", fontWeight: 600, marginBottom: 4 }}>
              Requirements
            </p>
            <ul style={{ color: "#6B7A8D", fontSize: "0.74rem", lineHeight: 1.7, margin: 0, paddingLeft: 14 }}>
              <li>You must have USDC on the source chain (e.g. Ethereum Sepolia)</li>
              <li>Get testnet USDC from <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" style={{ color: "#00D4FF" }}>faucet.circle.com</a></li>
              <li>Your wallet must be connected to Arc Testnet</li>
              <li>Bridge may take 1–5 minutes to complete</li>
            </ul>
          </div>
        </div>

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

        {/* To chain */}
        <div style={{
          background: "rgba(0,255,133,0.05)",
          border: "1px solid rgba(0,255,133,0.1)",
          borderRadius: 10, padding: "10px 14px",
          marginBottom: 20, fontSize: "0.8rem", color: "#6B7A8D"
        }}>
          → To: <span style={{ color: "#00FF85", fontWeight: 600 }}>Arc Testnet</span>
        </div>

        {error && (
          <div style={{
            background: "rgba(255,77,109,0.08)",
            border: "1px solid rgba(255,77,109,0.25)",
            borderRadius: 10, padding: "12px 14px",
            color: "#FF4D6D", fontSize: "0.82rem", marginBottom: 16,
            lineHeight: 1.6,
          }}>⚠️ {error}</div>
        )}

        {success && (
          <div style={{
            background: "rgba(0,255,133,0.08)",
            border: "1px solid rgba(0,255,133,0.25)",
            borderRadius: 10, padding: "12px 14px",
            color: "#00FF85", fontSize: "0.82rem", marginBottom: 16
          }}>✅ {success}</div>
        )}

        <button
          onClick={handleBridge}
          disabled={isLoading}
          style={{
            width: "100%", padding: "14px",
            background: isLoading ? "rgba(0,255,133,0.08)" : "rgba(0,255,133,0.15)",
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
      <button
        onClick={() => setShowModal(true)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(0,255,133,0.08)",
          border: "1px solid rgba(0,255,133,0.25)",
          borderRadius: "999px", color: "#00FF85",
          fontSize: "0.8rem", fontWeight: 600,
          padding: "6px 14px", cursor: "pointer",
          transition: "all 0.2s ease", whiteSpace: "nowrap",
        }}
      >
        <ArrowLeftRight size={13} />
        Bridge USDC to Arc
      </button>

      {showModal && ReactDOM.createPortal(modal, document.body)}
    </>
  )
}
