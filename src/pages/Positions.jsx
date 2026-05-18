import { useAccount } from "wagmi"
import { useUserData } from "../hooks/useUserData"
import { useProtocol } from "../hooks/useProtocol"
import HealthFactor from "../components/HealthFactor"
import { formatUSDC, formatWETH } from "../lib/utils"
import { AlertCircle, ExternalLink, RefreshCw } from "lucide-react"

export default function Positions() {
  const { isConnected, address } = useAccount()
  const {
    supplyBalance,
    supplyAmount,
    totalDebt,
    healthFactor,
    collateralAmount,
    usdcBalance,
    wethBalance,
    maxBorrow,
    isLoading,
    refetch,
  } = useUserData()

  const { supplyAPY, borrowAPY, totalSupplied, totalBorrowed } = useProtocol()

  if (!isConnected) {
    return (
      <div style={{ width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "32px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", textAlign: "center" }}>
        <div style={{ width: "68px", height: "68px", borderRadius: "18px", backgroundColor: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <AlertCircle size={30} color="#4ade80" />
        </div>
        <h2 style={{ color: "white", fontWeight: "bold", fontSize: "22px", marginBottom: "10px" }}>Connect Your Wallet</h2>
        <p style={{ color: "#9ca3af", fontSize: "15px", maxWidth: "360px" }}>Connect your wallet to view your positions.</p>
      </div>
    )
  }

  const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "13px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  }

  return (
    <div style={{ width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "32px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── Page heading + refresh ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ color: "white", fontWeight: "bold", fontSize: "30px", marginBottom: "8px" }}>Your Positions</h1>
          <p style={{ color: "#9ca3af", fontSize: "15px" }}>Overview of your lending and borrowing positions.</p>
        </div>
        <button onClick={refetch} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", fontSize: "14px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)", color: "#9ca3af", cursor: "pointer" }}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* ── COMPACT WALLET CARD ── */}
      <div
        style={{
          width: "100%",
          boxSizing: "border-box",
          backgroundColor: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {/* Left — label + address */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>
            Wallet
          </span>
          <span style={{ color: "#4ade80", fontFamily: "monospace", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "320px" }}>
            {address}
          </span>
        </div>

        {/* Right — balance pills + ArcScan */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "999px", backgroundColor: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)" }}>
            <span style={{ color: "#9ca3af", fontSize: "11px", fontWeight: "500" }}>USDC</span>
            <span style={{ color: "white", fontSize: "13px", fontWeight: "700" }}>${formatUSDC(usdcBalance)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "999px", backgroundColor: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)" }}>
            <span style={{ color: "#9ca3af", fontSize: "11px", fontWeight: "500" }}>WETH</span>
            <span style={{ color: "white", fontSize: "13px", fontWeight: "700" }}>{formatWETH(wethBalance)}</span>
          </div>
          <div style={{ width: "1px", height: "24px", backgroundColor: "rgba(255,255,255,0.08)" }} />
          <a
            href={`https://testnet.arcscan.app/address/${address}`}
            target="_blank"
            rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9ca3af", fontSize: "13px", textDecoration: "none", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)", whiteSpace: "nowrap" }}
          >
            View on ArcScan <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* ── SUPPLY + BORROW side by side ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", width: "100%", boxSizing: "border-box" }}>

        {/* ── Supply Position — animated green top border ── */}
        <div style={{ width: "100%", boxSizing: "border-box", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #4ade80, #22d3ee, #4ade80)", backgroundSize: "200% 100%", animation: "shimmerGreen 2.5s linear infinite" }} />

          <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginTop: "3px" }}>
            <h3 style={{ color: "white", fontWeight: "600", fontSize: "15px" }}>Supply Position</h3>
            <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "999px", backgroundColor: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)", whiteSpace: "nowrap" }}>
              Earning {supplyAPY.toFixed(4)}% APY
            </span>
          </div>

          <div style={{ padding: "20px 22px" }}>
            {(supplyBalance > 0n || supplyAmount > 0n) ? (
              <div>
                {/* Supplied Balance */}
                <div style={rowStyle}>
                  <span style={{ color: "#9ca3af", fontSize: "14px" }}>Supplied Balance</span>
                  <span style={{ color: "white", fontWeight: "bold", fontSize: "16px" }}>
                    ${formatUSDC(supplyBalance > 0n ? supplyBalance : supplyAmount)}
                  </span>
                </div>

                {/* Current APY */}
                <div style={rowStyle}>
                  <span style={{ color: "#9ca3af", fontSize: "14px" }}>Current APY</span>
                  <span style={{ color: "#4ade80", fontWeight: "600", fontSize: "14px" }}>
                    {supplyAPY.toFixed(4)}%
                  </span>
                </div>

                {/* Interest Earned — Fix 2 */}
                <div style={rowStyle}>
                  <span style={{ color: "#9ca3af", fontSize: "14px" }}>Interest Earned</span>
                  <span style={{ color: "#4ade80", fontWeight: "600", fontSize: "14px" }}>
                    {supplyBalance > 0n && supplyAmount > 0n
                      ? `+$${formatUSDC(supplyBalance - supplyAmount > 0n ? supplyBalance - supplyAmount : 0n)}`
                      : "+$0.00"}
                  </span>
                </div>

                {/* Status badge */}
                <div style={{ ...rowStyle, borderBottom: "none" }}>
                  <span style={{ color: "#9ca3af", fontSize: "14px" }}>Status</span>
                  <span style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "999px", backgroundColor: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}>
                    Earning
                  </span>
                </div>

                <p style={{ color: "#6b7280", fontSize: "12px", marginTop: "14px", lineHeight: 1.6 }}>
                  Your USDC is actively earning interest. Withdraw anytime from the Supply page.
                </p>

                {/* Withdraw USDC button — Fix 2 */}
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("arc:navigate", { detail: "supply" }))}
                  style={{
                    marginTop: "16px",
                    width: "100%",
                    padding: "11px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    backgroundColor: "transparent",
                    border: "1px solid rgba(74,222,128,0.35)",
                    color: "#4ade80",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(74,222,128,0.08)"
                    e.currentTarget.style.borderColor = "rgba(74,222,128,0.6)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.borderColor = "rgba(74,222,128,0.35)"
                  }}
                >
                  Withdraw USDC →
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "6px" }}>No active supply position</p>
                <p style={{ color: "#6b7280", fontSize: "12px" }}>Go to the Supply page to start earning interest on your USDC.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Borrow Position — animated gold top border ── */}
        <div style={{ width: "100%", boxSizing: "border-box", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #eab308, #f97316, #eab308)", backgroundSize: "200% 100%", animation: "shimmerGold 2.5s linear infinite" }} />

          <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginTop: "3px" }}>
            <h3 style={{ color: "white", fontWeight: "600", fontSize: "15px" }}>Borrow Position</h3>
            {totalDebt > 0n ? (
              <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "999px", backgroundColor: "rgba(234,179,8,0.1)", color: "#eab308", border: "1px solid rgba(234,179,8,0.2)", whiteSpace: "nowrap" }}>
                Paying {borrowAPY.toFixed(2)}% APY
              </span>
            ) : (
              <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "999px", backgroundColor: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.08)" }}>
                No Active Loan
              </span>
            )}
          </div>

          <div style={{ padding: "20px 22px" }}>
            {(collateralAmount > 0n || totalDebt > 0n) ? (
              <div>
                <div style={rowStyle}>
                  <span style={{ color: "#9ca3af", fontSize: "14px" }}>Collateral Deposited</span>
                  <span style={{ color: "white", fontWeight: "bold", fontSize: "16px" }}>{formatWETH(collateralAmount)} WETH</span>
                </div>
                <div style={rowStyle}>
                  <span style={{ color: "#9ca3af", fontSize: "14px" }}>Total Debt</span>
                  <span style={{ color: "white", fontWeight: "bold", fontSize: "16px" }}>${formatUSDC(totalDebt)}</span>
                </div>
                <div style={rowStyle}>
                  <span style={{ color: "#9ca3af", fontSize: "14px" }}>Max Borrow</span>
                  <span style={{ color: "white", fontWeight: "bold", fontSize: "16px" }}>${formatUSDC(maxBorrow)}</span>
                </div>
                <div style={{ ...rowStyle, borderBottom: "none" }}>
                  <span style={{ color: "#9ca3af", fontSize: "14px" }}>Borrow APY</span>
                  <span style={{ color: "#eab308", fontWeight: "600", fontSize: "14px" }}>{borrowAPY.toFixed(2)}%</span>
                </div>

                {/* Fix 3 — breathing room above health factor */}
                {totalDebt > 0n && (
                  <div style={{ marginTop: "24px" }}>
                    <HealthFactor value={healthFactor} />
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "6px" }}>No active borrow position</p>
                <p style={{ color: "#6b7280", fontSize: "12px" }}>Go to the Borrow page to deposit collateral and borrow USDC.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Protocol Stats ── */}
      <div style={{ width: "100%", boxSizing: "border-box", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ color: "white", fontWeight: "600", fontSize: "15px" }}>Protocol Stats</h3>
        </div>
        <div style={{ padding: "20px 22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", width: "100%", boxSizing: "border-box" }}>
            <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "18px" }}>
              <p style={{ color: "#9ca3af", fontSize: "12px", marginBottom: "8px" }}>Total Protocol Supply</p>
              <p style={{ color: "white", fontWeight: "bold", fontSize: "22px" }}>${formatUSDC(totalSupplied)}</p>
            </div>
            <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "18px" }}>
              <p style={{ color: "#9ca3af", fontSize: "12px", marginBottom: "8px" }}>Total Protocol Borrow</p>
              <p style={{ color: "white", fontWeight: "bold", fontSize: "22px" }}>${formatUSDC(totalBorrowed)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes shimmerGreen {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes shimmerGold {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

    </div>
  )
}