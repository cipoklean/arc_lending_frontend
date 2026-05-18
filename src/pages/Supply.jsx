import { useState } from "react"
import { useAccount } from "wagmi"
import { useUserData } from "../hooks/useUserData"
import { useSupply } from "../hooks/useSupply"
import { useProtocol } from "../hooks/useProtocol"
import TokenInput from "../components/TokenInput"
import SuccessBanner from "../components/SuccessBanner"
import ErrorBanner from "../components/ErrorBanner"
import ActionButton from "../components/ActionButton"
import InfoTooltip from "../components/InfoTooltip"
import { formatUSDC } from "../lib/utils"
import { TrendingUp, ArrowDownLeft, AlertCircle, Info, Zap, Activity } from "lucide-react"

export default function Supply() {
  const { isConnected } = useAccount()
  const { usdcBalance, supplyBalance, supplyAmount, usdcAllowance, refetch } = useUserData()
  const { supplyAPY, supplyRate, borrowAPY, totalSupplied, totalBorrowed, utilization } = useProtocol()
  const { approve, supply, withdraw } = useSupply()

  const [supplyInput, setSupplyInput] = useState("")
  const [withdrawInput, setWithdrawInput] = useState("")
  const [activeTab, setActiveTab] = useState("supply")

  const [supplyStep, setSupplyStep] = useState("idle")
  const [withdrawStep, setWithdrawStep] = useState("idle")

  const [supplySuccess, setSupplySuccess] = useState("")
  const [withdrawSuccess, setWithdrawSuccess] = useState("")
  const [supplyError, setSupplyError] = useState("")
  const [withdrawError, setWithdrawError] = useState("")
  const [supplyTxHash, setSupplyTxHash] = useState(null)
  const [withdrawTxHash, setWithdrawTxHash] = useState(null)

  const usdcBalanceFormatted = formatUSDC(usdcBalance)
  const supplyBalanceFormatted = formatUSDC(supplyBalance > 0n ? supplyBalance : supplyAmount)
  const needsApproval = usdcAllowance < BigInt(Math.floor(parseFloat(supplyInput || "0") * 1e6))

  const estimatedYearly =
    supplyInput && parseFloat(supplyInput) > 0
      ? (parseFloat(supplyInput) * (Number(supplyRate) / 1e18)).toFixed(6)
      : null

  function parseError(err) {
    const msg = err?.message || ""
    if (msg.includes("User rejected") || msg.includes("user rejected")) return "You rejected the transaction."
    if (msg.includes("insufficient funds")) return "Insufficient funds for gas."
    if (msg.includes("Insufficient balance")) return "You do not have enough USDC."
    if (msg.includes("Insufficient pool liquidity")) return "Not enough liquidity in the pool."
    return "Something went wrong. Please try again."
  }

  async function handleSupply() {
    if (!supplyInput || parseFloat(supplyInput) <= 0) return setSupplyError("Please enter a valid amount.")
    setSupplyError(""); setSupplySuccess(""); setSupplyTxHash(null)
    try {
      if (needsApproval) { setSupplyStep("approving"); await approve(supplyInput) }
      setSupplyStep("supplying")
      const hash = await supply(supplyInput)
      setSupplyTxHash(hash); setSupplyStep("idle")
      setSupplySuccess(`Successfully supplied ${supplyInput} USDC to the lending pool.`)
      setSupplyInput(""); refetch()
    } catch (err) { setSupplyError(parseError(err)); setSupplyStep("idle") }
  }

  async function handleWithdraw() {
    if (!withdrawInput || parseFloat(withdrawInput) <= 0) return setWithdrawError("Please enter a valid amount.")
    setWithdrawError(""); setWithdrawSuccess(""); setWithdrawTxHash(null)
    try {
      setWithdrawStep("withdrawing")
      const hash = await withdraw(withdrawInput)
      setWithdrawTxHash(hash); setWithdrawStep("idle")
      setWithdrawSuccess(`Successfully withdrew ${withdrawInput} USDC from the lending pool.`)
      setWithdrawInput(""); refetch()
    } catch (err) { setWithdrawError(parseError(err)); setWithdrawStep("idle") }
  }

  function switchTab(tab) {
    setActiveTab(tab)
    setSupplyError(""); setWithdrawError("")
    setSupplySuccess(""); setWithdrawSuccess("")
    setSupplyStep("idle"); setWithdrawStep("idle")
  }

  if (!isConnected) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "32px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "68px", height: "68px", borderRadius: "18px",
            backgroundColor: "rgba(74,222,128,0.1)",
            border: "1px solid rgba(74,222,128,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <AlertCircle size={30} color="#4ade80" />
        </div>
        <h2 style={{ color: "white", fontWeight: "bold", fontSize: "22px", marginBottom: "10px" }}>
          Connect Your Wallet
        </h2>
        <p style={{ color: "#9ca3af", fontSize: "15px", maxWidth: "360px" }}>
          Connect your wallet to supply USDC and earn interest.
        </p>
      </div>
    )
  }

  return (
    /* ── Outer wrapper ── */
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "32px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "28px",
      }}
    >

      {/* ── Page heading ── */}
      <div>
        <h1 style={{ color: "white", fontWeight: "bold", fontSize: "30px", marginBottom: "8px" }}>
          Supply USDC
        </h1>
        <p style={{ color: "#9ca3af", fontSize: "15px" }}>
          Deposit USDC to earn interest. Your balance grows automatically every second.
        </p>
      </div>

      {/* ── Stats row — 3 equal columns ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {[
          {
            label: "Supply APY",
            value: `${supplyAPY.toFixed(4)}%`,
            color: "#4ade80",
            tooltip: "Supply APY grows as more USDC is borrowed. Currently low due to low utilization.",
          },
          { label: "Your Supply",    value: `$${supplyBalanceFormatted}`, color: "white" },
          { label: "Wallet Balance", value: `$${usdcBalanceFormatted}`,   color: "white" },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              width: "100%",
              boxSizing: "border-box",
              backgroundColor: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "8px" }}>
              <p style={{ color: "#9ca3af", fontSize: "13px" }}>{s.label}</p>
              {s.tooltip && <InfoTooltip text={s.tooltip} />}
            </div>
            <p style={{ color: s.color, fontWeight: "bold", fontSize: "22px" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          TWO-COLUMN LAYOUT: 60% form  |  38% info panel
      ══════════════════════════════════════════════ */}
      <div
        style={{
          display: "flex",
          gap: "2%",
          width: "100%",
          boxSizing: "border-box",
          alignItems: "flex-start",
        }}
      >

        {/* ── LEFT COLUMN — 60% — form ── */}
        <div
          style={{
            width: "60%",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            boxSizing: "border-box",
          }}
        >

          {/* Tab switcher */}
          <div style={{ display: "flex", gap: "10px", width: "100%" }}>
            <button
              onClick={() => switchTab("supply")}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: "500", cursor: "pointer",
                border: activeTab === "supply" ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(255,255,255,0.08)",
                backgroundColor: activeTab === "supply" ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.02)",
                color: activeTab === "supply" ? "#4ade80" : "#9ca3af",
              }}
            >
              <TrendingUp size={17} /> Supply
            </button>
            <button
              onClick={() => switchTab("withdraw")}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: "500", cursor: "pointer",
                border: activeTab === "withdraw" ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(255,255,255,0.08)",
                backgroundColor: activeTab === "withdraw" ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.02)",
                color: activeTab === "withdraw" ? "#4ade80" : "#9ca3af",
              }}
            >
              <ArrowDownLeft size={17} /> Withdraw
            </button>
          </div>

          {/* Supply form card */}
          {activeTab === "supply" && (
            <div
              style={{
                width: "100%",
                boxSizing: "border-box",
                backgroundColor: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div>
                <h3 style={{ color: "white", fontWeight: "600", fontSize: "18px", marginBottom: "6px" }}>
                  Amount to Supply
                </h3>
                <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "18px" }}>
                  Enter how much USDC you want to deposit into the lending pool.
                </p>
                <TokenInput
                  label="Supply Amount"
                  token="USDC"
                  value={supplyInput}
                  onChange={setSupplyInput}
                  balance={usdcBalanceFormatted}
                  maxAmount={usdcBalanceFormatted}
                  hint={estimatedYearly ? `You will earn ~$${estimatedYearly} per year` : ""}
                />
              </div>

              {needsApproval && supplyInput && (
                <div
                  style={{
                    backgroundColor: "rgba(234,179,8,0.05)",
                    border: "1px solid rgba(234,179,8,0.2)",
                    borderRadius: "12px",
                    padding: "16px",
                  }}
                >
                  <p style={{ color: "#eab308", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
                    Two steps required
                  </p>
                  <p style={{ color: "#9ca3af", fontSize: "13px" }}>
                    Step 1: Approve USDC spending → Step 2: Supply USDC
                  </p>
                </div>
              )}

              <SuccessBanner message={supplySuccess} txHash={supplyTxHash} onClose={() => setSupplySuccess("")} />
              <ErrorBanner message={supplyError} onClose={() => setSupplyError("")} />

              <ActionButton
                onClick={handleSupply}
                disabled={!supplyInput || parseFloat(supplyInput || "0") <= 0}
                loading={supplyStep !== "idle"}
                loadingLabel={supplyStep === "approving" ? "Approving USDC..." : "Supplying..."}
                label={needsApproval && supplyInput ? "Approve and Supply" : "Supply USDC"}
                color="green"
              />
            </div>
          )}

          {/* Withdraw form card */}
          {activeTab === "withdraw" && (
            <div
              style={{
                width: "100%",
                boxSizing: "border-box",
                backgroundColor: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div>
                <h3 style={{ color: "white", fontWeight: "600", fontSize: "18px", marginBottom: "6px" }}>
                  Amount to Withdraw
                </h3>
                <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "18px" }}>
                  Withdraw your supplied USDC plus any earned interest.
                </p>
                <TokenInput
                  label="Withdraw Amount"
                  token="USDC"
                  value={withdrawInput}
                  onChange={setWithdrawInput}
                  balance={supplyBalanceFormatted}
                  maxAmount={supplyBalanceFormatted}
                />
              </div>

              <SuccessBanner message={withdrawSuccess} txHash={withdrawTxHash} onClose={() => setWithdrawSuccess("")} />
              <ErrorBanner message={withdrawError} onClose={() => setWithdrawError("")} />

              <ActionButton
                onClick={handleWithdraw}
                disabled={!withdrawInput || parseFloat(withdrawInput || "0") <= 0}
                loading={withdrawStep !== "idle"}
                loadingLabel="Withdrawing..."
                label="Withdraw USDC"
                color="green"
              />
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN — 38% — sticky info panel ── */}
        <div
          style={{
            width: "38%",
            flexShrink: 0,
            position: "sticky",
            top: "80px",               /* stays visible as user scrolls */
            alignSelf: "flex-start",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            boxSizing: "border-box",
          }}
        >

          {/* Live APY Stats card */}
          <div
            style={{
              width: "100%",
              boxSizing: "border-box",
              backgroundColor: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              overflow: "hidden",

              /* green top border accent */
              borderTop: "3px solid #4ade80",
            }}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Activity size={15} color="#4ade80" />
              <h3 style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>
                Live Pool Stats
              </h3>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* Supply APY */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9ca3af", fontSize: "13px" }}>Supply APY</span>
                <span style={{ color: "#4ade80", fontWeight: "700", fontSize: "16px" }}>
                  {supplyAPY.toFixed(4)}%
                </span>
              </div>
              <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.05)" }} />

              {/* Borrow APY */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9ca3af", fontSize: "13px" }}>Borrow APY</span>
                <span style={{ color: "#eab308", fontWeight: "700", fontSize: "16px" }}>
                  {borrowAPY.toFixed(2)}%
                </span>
              </div>
              <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.05)" }} />

              {/* Total Supplied */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9ca3af", fontSize: "13px" }}>Total Supplied</span>
                <span style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>
                  ${formatUSDC(totalSupplied)}
                </span>
              </div>
              <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.05)" }} />

              {/* Total Borrowed */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9ca3af", fontSize: "13px" }}>Total Borrowed</span>
                <span style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>
                  ${formatUSDC(totalBorrowed)}
                </span>
              </div>
              <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.05)" }} />

              {/* Utilization */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ color: "#9ca3af", fontSize: "13px" }}>Utilization</span>
                  <span style={{ color: "#4ade80", fontWeight: "600", fontSize: "14px" }}>
                    {utilization.toFixed(2)}%
                  </span>
                </div>
                <div style={{ height: "6px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(utilization, 100)}%`,
                      background: "linear-gradient(90deg, #4ade80, #22d3ee)",
                      borderRadius: "999px",
                      transition: "width 0.5s ease",
                      minWidth: utilization > 0 ? "4px" : "0",
                    }}
                  />
                </div>
              </div>

              {/* Estimated yearly earnings */}
              {estimatedYearly && (
                <>
                  <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.05)" }} />
                  <div
                    style={{
                      backgroundColor: "rgba(74,222,128,0.06)",
                      border: "1px solid rgba(74,222,128,0.15)",
                      borderRadius: "10px",
                      padding: "12px",
                    }}
                  >
                    <p style={{ color: "#6b7280", fontSize: "11px", marginBottom: "4px" }}>
                      Estimated yearly earnings
                    </p>
                    <p style={{ color: "#4ade80", fontWeight: "700", fontSize: "18px" }}>
                      ~${estimatedYearly}
                    </p>
                    <p style={{ color: "#6b7280", fontSize: "11px", marginTop: "2px" }}>
                      for {supplyInput} USDC supplied
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Good to know card */}
          <div
            style={{
              width: "100%",
              boxSizing: "border-box",
              backgroundColor: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              overflow: "hidden",

              /* green top border accent */
              borderTop: "3px solid #4ade80",
            }}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Info size={15} color="#4ade80" />
              <h3 style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>
                Good to Know
              </h3>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                {
                  icon: "✓",
                  color: "#4ade80",
                  text: "Interest is earned every second and added to your balance automatically",
                },
                {
                  icon: "✓",
                  color: "#4ade80",
                  text: "Withdraw anytime as long as there is enough liquidity in the pool",
                },
                {
                  icon: "✓",
                  color: "#4ade80",
                  text: "APY rises automatically as more USDC is borrowed from the pool",
                },
                {
                  icon: "✓",
                  color: "#4ade80",
                  text: "Supply APY is low at low utilization — it grows as borrowing increases",
                },
                {
                  icon: "!",
                  color: "#eab308",
                  text: "Testnet only. Do not supply real funds.",
                },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{ color: item.color, fontSize: "13px", flexShrink: 0, marginTop: "1px", fontWeight: "bold" }}>
                    {item.icon}
                  </span>
                  <p style={{ color: "#9ca3af", fontSize: "13px", lineHeight: 1.65 }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Zap quick tip */}
          <div
            style={{
              width: "100%",
              boxSizing: "border-box",
              backgroundColor: "rgba(74,222,128,0.04)",
              border: "1px solid rgba(74,222,128,0.15)",
              borderRadius: "12px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <Zap size={15} color="#4ade80" style={{ flexShrink: 0, marginTop: "2px" }} />
            <p style={{ color: "#6b7280", fontSize: "12px", lineHeight: 1.65 }}>
              <span style={{ color: "#4ade80", fontWeight: "600" }}>Tip: </span>
              The more USDC borrowed from the pool, the higher your Supply APY becomes.
              Current utilization is{" "}
              <span style={{ color: "#9ca3af", fontWeight: "600" }}>{utilization.toFixed(2)}%</span>.
            </p>
          </div>

        </div>
        {/* end right column */}

      </div>
      {/* end two-column layout */}

    </div>
  )
}
