import { useState, useEffect } from "react"
import { getAppKit, getViemAdapter } from "../lib/appKit"
import { useAccount } from "wagmi"
import { Layers } from "lucide-react"

export default function UnifiedBalance() {
  const { isConnected } = useAccount()
  const [balance, setBalance]     = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState(null)
  const [showPanel, setShowPanel] = useState(false)

  async function fetchBalance() {
    if (!isConnected || !window.ethereum) return
    setIsLoading(true)
    setError(null)
    try {
      const kit         = await getAppKit()
      const viemAdapter = await getViemAdapter()

      // Correct method is getBalances (plural) with sources array
      const result = await kit.unifiedBalance.getBalances({
        sources: [{ adapter: viemAdapter }],
        networkType: "testnet",
        includePending: true,
      })

      setBalance(result)
    } catch (err) {
      console.error("Unified balance error:", err)
      setError("Could not fetch unified balance")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected && showPanel) fetchBalance()
  }, [isConnected, showPanel])

  if (!isConnected) return null

  // Parse balance data from SDK response
  const totalConfirmed = balance?.totalConfirmedBalance || "0.00"
  const totalPending   = balance?.totalPendingBalance   || "0.00"
  const breakdown      = balance?.breakdown             || []

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowPanel(!showPanel)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(0,212,255,0.08)",
          border: "1px solid rgba(0,212,255,0.25)",
          borderRadius: "999px",
          color: "#00D4FF", fontSize: "0.8rem",
          fontWeight: 600, padding: "6px 14px",
          cursor: "pointer", whiteSpace: "nowrap",
        }}
      >
        <Layers size={13} />
        Unified Balance
      </button>

      {showPanel && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowPanel(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 98,
            }}
          />

          {/* Panel */}
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0,
            background: "#0D1117",
            border: "1px solid rgba(0,212,255,0.2)",
            borderRadius: 16, padding: 20,
            minWidth: 300, zIndex: 99,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Layers size={16} color="#00D4FF" />
              <span style={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}>
                Your USDC Across All Chains
              </span>
            </div>

            {isLoading && (
              <p style={{ color: "#6B7A8D", fontSize: "0.85rem", textAlign: "center", padding: "16px 0" }}>
                Loading balances...
              </p>
            )}

            {error && (
              <p style={{ color: "#FF4D6D", fontSize: "0.82rem" }}>⚠️ {error}</p>
            )}

            {balance && !isLoading && (
              <div>
                {/* Total */}
                <div style={{
                  background: "rgba(0,212,255,0.06)",
                  border: "1px solid rgba(0,212,255,0.15)",
                  borderRadius: 12, padding: "14px 16px", marginBottom: 12
                }}>
                  <p style={{ color: "#6B7A8D", fontSize: "0.75rem", marginBottom: 4 }}>
                    Total Confirmed Balance
                  </p>
                  <p style={{ color: "#00D4FF", fontFamily: "'DM Serif Display', serif", fontSize: "1.8rem" }}>
                    ${parseFloat(totalConfirmed).toFixed(2)}
                  </p>
                  {parseFloat(totalPending) > 0 && (
                    <p style={{ color: "#6B7A8D", fontSize: "0.72rem", marginTop: 4 }}>
                      + ${parseFloat(totalPending).toFixed(2)} pending
                    </p>
                  )}
                  <p style={{ color: "#6B7A8D", fontSize: "0.72rem", marginTop: 2 }}>
                    USDC across all chains
                  </p>
                </div>

                {/* Breakdown per depositor */}
                {breakdown.length > 0 && breakdown.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <span style={{ color: "#9CA3AF", fontSize: "0.78rem" }}>
                      {item.depositor
                        ? `${item.depositor.slice(0, 6)}...${item.depositor.slice(-4)}`
                        : `Wallet ${i + 1}`}
                    </span>
                    <span style={{ color: "white", fontSize: "0.82rem", fontWeight: 600 }}>
                      ${parseFloat(item.totalConfirmed || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={fetchBalance}
              style={{
                width: "100%", marginTop: 12, padding: "8px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8, color: "#6B7A8D",
                fontSize: "0.78rem", cursor: "pointer",
              }}
            >
              ↻ Refresh
            </button>
          </div>
        </>
      )}
    </div>
  )
}
