import { useState } from "react"
import { useAccount } from "wagmi"
import { useUserData } from "../hooks/useUserData"
import { useBorrow } from "../hooks/useBorrow"
import { useProtocol } from "../hooks/useProtocol"
import TokenInput from "../components/TokenInput"
import SuccessBanner from "../components/SuccessBanner"
import ErrorBanner from "../components/ErrorBanner"
import ActionButton from "../components/ActionButton"
import HealthFactor from "../components/HealthFactor"
import InfoTooltip from "../components/InfoTooltip"
import { formatUSDC, formatWETH } from "../lib/utils"
import { Shield, ArrowDownUp, AlertCircle, Info, Activity, Zap } from "lucide-react"

export default function Borrow() {
  const { isConnected } = useAccount()
  const {
    wethBalance,
    collateralAmount,
    totalDebt,
    maxBorrow,
    healthFactor,
    wethAllowance,
    usdcAllowance,
    usdcBalance,
    refetch,
  } = useUserData()

  const { borrowAPY, supplyAPY, totalSupplied, totalBorrowed, utilization } = useProtocol()
  const {
    approveWeth,
    depositCollateral,
    borrow,
    approveRepay,
    repay,
    withdrawCollateral,
  } = useBorrow()

  const [activeTab, setActiveTab] = useState("collateral")

  const [collateralInput, setCollateralInput]               = useState("")
  const [borrowInput, setBorrowInput]                       = useState("")
  const [repayInput, setRepayInput]                         = useState("")
  const [withdrawCollateralInput, setWithdrawCollateralInput] = useState("")

  const [collateralStep, setCollateralStep]                 = useState("idle")
  const [borrowStep, setBorrowStep]                         = useState("idle")
  const [repayStep, setRepayStep]                           = useState("idle")
  const [withdrawCollateralStep, setWithdrawCollateralStep] = useState("idle")

  const [collateralSuccess, setCollateralSuccess]           = useState("")
  const [borrowSuccess, setBorrowSuccess]                   = useState("")
  const [repaySuccess, setRepaySuccess]                     = useState("")
  const [withdrawCollateralSuccess, setWithdrawCollateralSuccess] = useState("")

  const [collateralError, setCollateralError]               = useState("")
  const [borrowError, setBorrowError]                       = useState("")
  const [repayError, setRepayError]                         = useState("")
  const [withdrawCollateralError, setWithdrawCollateralError] = useState("")

  const [lastTxHash, setLastTxHash] = useState(null)

  const wethBalanceFormatted    = formatWETH(wethBalance)
  const collateralFormatted     = formatWETH(collateralAmount)
  const maxBorrowFormatted      = formatUSDC(maxBorrow)
  const totalDebtFormatted      = formatUSDC(totalDebt)
  const usdcBalanceFormatted    = formatUSDC(usdcBalance)

  const needsWethApproval   = wethAllowance < BigInt(Math.floor(parseFloat(collateralInput || "0") * 1e18))
  const needsRepayApproval  = usdcAllowance < BigInt(Math.floor(parseFloat(repayInput || "0") * 1e6))

  /* estimated borrow cost per year */
  const estimatedYearlyCost =
    borrowInput && parseFloat(borrowInput) > 0
      ? (parseFloat(borrowInput) * (Number(borrowAPY) / 100)).toFixed(4)
      : null

  function parseError(err) {
    const msg = err?.message || ""
    if (msg.includes("User rejected") || msg.includes("user rejected")) return "You rejected the transaction."
    if (msg.includes("insufficient funds"))        return "Insufficient funds for gas."
    if (msg.includes("Exceeds borrow limit"))       return "Amount exceeds your maximum borrow limit."
    if (msg.includes("Insufficient pool liquidity")) return "Not enough liquidity in the pool right now."
    if (msg.includes("No collateral deposited"))    return "You need to deposit collateral before borrowing."
    if (msg.includes("Must repay all debt first"))  return "You must repay all debt before withdrawing collateral."
    if (msg.includes("Insufficient collateral"))    return "Not enough collateral to withdraw that amount."
    return "Something went wrong. Please try again."
  }

  async function handleDepositCollateral() {
    if (!collateralInput || parseFloat(collateralInput) <= 0) return setCollateralError("Please enter a valid amount.")
    setCollateralError(""); setCollateralSuccess(""); setLastTxHash(null)
    try {
      if (needsWethApproval) { setCollateralStep("approving"); await approveWeth(collateralInput) }
      setCollateralStep("depositing")
      const hash = await depositCollateral(collateralInput)
      setLastTxHash(hash); setCollateralStep("idle"); setCollateralInput("")
      setCollateralSuccess(`Successfully deposited ${collateralInput} WETH as collateral.`); refetch()
    } catch (err) { setCollateralError(parseError(err)); setCollateralStep("idle") }
  }

  async function handleBorrow() {
    if (!borrowInput || parseFloat(borrowInput) <= 0) return setBorrowError("Please enter a valid amount.")
    setBorrowError(""); setBorrowSuccess(""); setLastTxHash(null)
    try {
      setBorrowStep("borrowing")
      const hash = await borrow(borrowInput)
      setLastTxHash(hash); setBorrowStep("idle"); setBorrowInput("")
      setBorrowSuccess(`Successfully borrowed ${borrowInput} USDC.`); refetch()
    } catch (err) { setBorrowError(parseError(err)); setBorrowStep("idle") }
  }

  async function handleRepay() {
    if (!repayInput || parseFloat(repayInput) <= 0) return setRepayError("Please enter a valid amount.")
    setRepayError(""); setRepaySuccess(""); setLastTxHash(null)
    try {
      if (needsRepayApproval) { setRepayStep("approving"); await approveRepay(repayInput) }
      setRepayStep("repaying")
      const hash = await repay(repayInput)
      setLastTxHash(hash); setRepayStep("idle"); setRepayInput("")
      setRepaySuccess(`Successfully repaid ${repayInput} USDC.`); refetch()
    } catch (err) { setRepayError(parseError(err)); setRepayStep("idle") }
  }

  async function handleWithdrawCollateral() {
    if (!withdrawCollateralInput || parseFloat(withdrawCollateralInput) <= 0)
      return setWithdrawCollateralError("Please enter a valid amount.")
    setWithdrawCollateralError(""); setWithdrawCollateralSuccess(""); setLastTxHash(null)
    try {
      setWithdrawCollateralStep("withdrawing")
      const hash = await withdrawCollateral(withdrawCollateralInput)
      setLastTxHash(hash); setWithdrawCollateralStep("idle"); setWithdrawCollateralInput("")
      setWithdrawCollateralSuccess(`Successfully withdrew ${withdrawCollateralInput} WETH collateral.`); refetch()
    } catch (err) { setWithdrawCollateralError(parseError(err)); setWithdrawCollateralStep("idle") }
  }

  function switchTab(tab) {
    setActiveTab(tab)
    setCollateralError(""); setBorrowError(""); setRepayError(""); setWithdrawCollateralError("")
    setCollateralSuccess(""); setBorrowSuccess(""); setRepaySuccess(""); setWithdrawCollateralSuccess("")
  }

  /* ── reusable panel card style ── */
  const panelStyle = {
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  }

  const warningBox = (r, g, b) => ({
    backgroundColor: `rgba(${r},${g},${b},0.05)`,
    border: `1px solid rgba(${r},${g},${b},0.2)`,
    borderRadius: "12px",
    padding: "16px",
  })

  const TABS = [
    { id: "collateral",          label: "Deposit Collateral" },
    { id: "borrow",              label: "Borrow" },
    { id: "repay",               label: "Repay" },
    { id: "withdraw-collateral", label: "Withdraw Collateral" },
  ]

  if (!isConnected) {
    return (
      <div
        style={{
          width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "32px",
          boxSizing: "border-box", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", minHeight: "400px", textAlign: "center",
        }}
      >
        <div style={{ width: "68px", height: "68px", borderRadius: "18px", backgroundColor: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <AlertCircle size={30} color="#4ade80" />
        </div>
        <h2 style={{ color: "white", fontWeight: "bold", fontSize: "22px", marginBottom: "10px" }}>Connect Your Wallet</h2>
        <p style={{ color: "#9ca3af", fontSize: "15px", maxWidth: "360px" }}>Connect your wallet to deposit collateral and borrow USDC.</p>
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
        <h1 style={{ color: "white", fontWeight: "bold", fontSize: "30px", marginBottom: "8px" }}>Borrow USDC</h1>
        <p style={{ color: "#9ca3af", fontSize: "15px" }}>Deposit WETH as collateral and borrow up to 75% of its value in USDC.</p>
      </div>

      {/* ── Stats row — 4 equal columns — full width ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {[
          { label: "Borrow APY",  value: `${borrowAPY.toFixed(2)}%`,    color: "#eab308", tooltip: "Annual interest rate you pay on borrowed USDC." },
          { label: "Max Borrow",  value: `$${maxBorrowFormatted}`,       color: "white",   tooltip: "Maximum USDC you can borrow based on 75% LTV ratio." },
          { label: "Your Debt",   value: `$${totalDebtFormatted}`,       color: "white"   },
          { label: "Collateral",  value: `${collateralFormatted} WETH`,  color: "white"   },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              width: "100%", boxSizing: "border-box",
              backgroundColor: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px", padding: "20px", textAlign: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "8px" }}>
              <p style={{ color: "#9ca3af", fontSize: "13px" }}>{s.label}</p>
              {s.tooltip && <InfoTooltip text={s.tooltip} />}
            </div>
            <p style={{ color: s.color, fontWeight: "bold", fontSize: "20px" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Health factor — full width, above the two-column split ── */}
      {totalDebt > 0n && (
        <div style={{ width: "100%", boxSizing: "border-box" }}>
          <HealthFactor value={healthFactor} />
        </div>
      )}

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

        {/* ── LEFT COLUMN — 60% — tabs + form panels ── */}
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

          {/* Tab buttons */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "10px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                style={{
                  width: "100%", padding: "12px 8px", borderRadius: "12px",
                  fontSize: "13px", fontWeight: "500", cursor: "pointer",
                  border: activeTab === tab.id
                    ? "1px solid rgba(74,222,128,0.3)"
                    : "1px solid rgba(255,255,255,0.08)",
                  backgroundColor: activeTab === tab.id
                    ? "rgba(74,222,128,0.1)"
                    : "rgba(255,255,255,0.02)",
                  color: activeTab === tab.id ? "#4ade80" : "#9ca3af",
                  boxSizing: "border-box",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Deposit Collateral panel ── */}
          {activeTab === "collateral" && (
            <div style={panelStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Shield size={22} color="#22d3ee" />
                <h3 style={{ color: "white", fontWeight: "600", fontSize: "18px" }}>Deposit WETH Collateral</h3>
              </div>
              <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.7 }}>
                Deposit WETH to use as collateral. You can borrow up to 75% of its value.
                1 WETH = $2,000 so 1 WETH lets you borrow up to $1,500 USDC.
              </p>
              <TokenInput
                label="WETH Amount" token="WETH"
                value={collateralInput} onChange={setCollateralInput}
                balance={wethBalanceFormatted} maxAmount={wethBalanceFormatted}
                hint={collateralInput && parseFloat(collateralInput) > 0
                  ? `Borrowing power: $${(parseFloat(collateralInput) * 2000 * 0.75).toFixed(2)} USDC`
                  : ""}
              />
              {needsWethApproval && collateralInput && (
                <div style={warningBox(234, 179, 8)}>
                  <p style={{ color: "#eab308", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>Two steps required</p>
                  <p style={{ color: "#9ca3af", fontSize: "13px" }}>Step 1: Approve WETH → Step 2: Deposit collateral</p>
                </div>
              )}
              <SuccessBanner message={collateralSuccess} txHash={lastTxHash} onClose={() => setCollateralSuccess("")} />
              <ErrorBanner   message={collateralError}   onClose={() => setCollateralError("")} />
              <ActionButton
                onClick={handleDepositCollateral}
                disabled={!collateralInput || parseFloat(collateralInput || "0") <= 0}
                loading={collateralStep !== "idle"}
                loadingLabel={collateralStep === "approving" ? "Approving WETH..." : "Depositing..."}
                label={needsWethApproval && collateralInput ? "Approve and Deposit" : "Deposit Collateral"}
                color="cyan"
              />
            </div>
          )}

          {/* ── Borrow panel ── */}
          {activeTab === "borrow" && (
            <div style={panelStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ArrowDownUp size={22} color="#eab308" />
                <h3 style={{ color: "white", fontWeight: "600", fontSize: "18px" }}>Borrow USDC</h3>
              </div>
              <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.7 }}>
                Borrow USDC against your deposited WETH collateral.
                Maximum borrow is 75% of your collateral value.
                Keep your health factor above 1.5 to stay safe.
              </p>
              {collateralAmount === 0n && (
                <div style={warningBox(234, 179, 8)}>
                  <p style={{ color: "#eab308", fontSize: "14px", fontWeight: "500" }}>No collateral deposited</p>
                  <p style={{ color: "#9ca3af", fontSize: "13px", marginTop: "4px" }}>
                    Go to the Deposit Collateral tab first to deposit WETH before borrowing.
                  </p>
                </div>
              )}
              <TokenInput
                label="Borrow Amount" token="USDC"
                value={borrowInput} onChange={setBorrowInput}
                balance={`Max: $${maxBorrowFormatted}`} maxAmount={maxBorrowFormatted}
                hint={borrowInput && parseFloat(borrowInput) > 0
                  ? `Borrow APY: ${borrowAPY.toFixed(2)}% per year`
                  : ""}
              />
              {estimatedYearlyCost && (
                <div
                  style={{
                    backgroundColor: "rgba(234,179,8,0.05)",
                    border: "1px solid rgba(234,179,8,0.15)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                  }}
                >
                  <p style={{ color: "#6b7280", fontSize: "11px", marginBottom: "3px" }}>Estimated yearly interest cost</p>
                  <p style={{ color: "#eab308", fontWeight: "700", fontSize: "16px" }}>~${estimatedYearlyCost} USDC</p>
                  <p style={{ color: "#6b7280", fontSize: "11px", marginTop: "2px" }}>for {borrowInput} USDC borrowed</p>
                </div>
              )}
              <SuccessBanner message={borrowSuccess} txHash={lastTxHash} onClose={() => setBorrowSuccess("")} />
              <ErrorBanner   message={borrowError}   onClose={() => setBorrowError("")} />
              <ActionButton
                onClick={handleBorrow}
                disabled={!borrowInput || parseFloat(borrowInput || "0") <= 0 || collateralAmount === 0n}
                loading={borrowStep !== "idle"}
                loadingLabel="Borrowing..."
                label="Borrow USDC"
                color="yellow"
              />
            </div>
          )}

          {/* ── Repay panel ── */}
          {activeTab === "repay" && (
            <div style={panelStyle}>
              <h3 style={{ color: "white", fontWeight: "600", fontSize: "18px" }}>Repay USDC</h3>
              <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.7 }}>
                Repay your borrowed USDC to reduce your debt and improve your health factor.
                You must repay all debt before withdrawing collateral.
              </p>
              {totalDebt === 0n && (
                <div style={warningBox(255, 255, 255)}>
                  <p style={{ color: "#9ca3af", fontSize: "14px" }}>You have no active debt to repay.</p>
                </div>
              )}
              <TokenInput
                label="Repay Amount" token="USDC"
                value={repayInput} onChange={setRepayInput}
                balance={`Debt: $${totalDebtFormatted}`} maxAmount={totalDebtFormatted}
                hint={`Wallet USDC: $${usdcBalanceFormatted}`}
              />
              {needsRepayApproval && repayInput && (
                <div style={warningBox(234, 179, 8)}>
                  <p style={{ color: "#eab308", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>Two steps required</p>
                  <p style={{ color: "#9ca3af", fontSize: "13px" }}>Step 1: Approve USDC → Step 2: Repay</p>
                </div>
              )}
              <SuccessBanner message={repaySuccess} txHash={lastTxHash} onClose={() => setRepaySuccess("")} />
              <ErrorBanner   message={repayError}   onClose={() => setRepayError("")} />
              <ActionButton
                onClick={handleRepay}
                disabled={!repayInput || parseFloat(repayInput || "0") <= 0 || totalDebt === 0n}
                loading={repayStep !== "idle"}
                loadingLabel={repayStep === "approving" ? "Approving USDC..." : "Repaying..."}
                label={needsRepayApproval && repayInput ? "Approve and Repay" : "Repay USDC"}
                color="green"
              />
            </div>
          )}

          {/* ── Withdraw Collateral panel ── */}
          {activeTab === "withdraw-collateral" && (
            <div style={panelStyle}>
              <h3 style={{ color: "white", fontWeight: "600", fontSize: "18px" }}>Withdraw Collateral</h3>
              <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.7 }}>
                Withdraw your WETH collateral after repaying all debt.
                You must have zero debt to withdraw collateral.
              </p>
              {totalDebt > 0n && (
                <div style={warningBox(239, 68, 68)}>
                  <p style={{ color: "#f87171", fontSize: "14px", fontWeight: "500" }}>Outstanding debt</p>
                  <p style={{ color: "#9ca3af", fontSize: "13px", marginTop: "4px" }}>
                    You must repay your full debt of ${totalDebtFormatted} before withdrawing collateral.
                  </p>
                </div>
              )}
              <TokenInput
                label="WETH Amount" token="WETH"
                value={withdrawCollateralInput} onChange={setWithdrawCollateralInput}
                balance={`Collateral: ${collateralFormatted}`} maxAmount={collateralFormatted}
              />
              <SuccessBanner message={withdrawCollateralSuccess} txHash={lastTxHash} onClose={() => setWithdrawCollateralSuccess("")} />
              <ErrorBanner   message={withdrawCollateralError}   onClose={() => setWithdrawCollateralError("")} />
              <ActionButton
                onClick={handleWithdrawCollateral}
                disabled={!withdrawCollateralInput || parseFloat(withdrawCollateralInput || "0") <= 0 || totalDebt > 0n}
                loading={withdrawCollateralStep !== "idle"}
                loadingLabel="Withdrawing..."
                label="Withdraw Collateral"
                color="green"
              />
            </div>
          )}

        </div>
        {/* end left column */}

        {/* ── RIGHT COLUMN — 38% — sticky info panel ── */}
        <div
          style={{
            width: "38%",
            flexShrink: 0,
            position: "sticky",
            top: "80px",
            alignSelf: "flex-start",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            boxSizing: "border-box",
          }}
        >

          {/* Live Borrow Stats */}
          <div
            style={{
              width: "100%",
              boxSizing: "border-box",
              backgroundColor: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              overflow: "hidden",
              borderTop: "3px solid #4ade80",
            }}
          >
            <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={15} color="#4ade80" />
              <h3 style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>Live Pool Stats</h3>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9ca3af", fontSize: "13px" }}>Borrow APY</span>
                <span style={{ color: "#eab308", fontWeight: "700", fontSize: "16px" }}>{borrowAPY.toFixed(2)}%</span>
              </div>
              <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.05)" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9ca3af", fontSize: "13px" }}>Supply APY</span>
                <span style={{ color: "#4ade80", fontWeight: "700", fontSize: "16px" }}>{supplyAPY.toFixed(4)}%</span>
              </div>
              <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.05)" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9ca3af", fontSize: "13px" }}>Max Borrow</span>
                <span style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>${maxBorrowFormatted}</span>
              </div>
              <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.05)" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9ca3af", fontSize: "13px" }}>Total Borrowed</span>
                <span style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>${formatUSDC(totalBorrowed)}</span>
              </div>
              <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.05)" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9ca3af", fontSize: "13px" }}>Total Supplied</span>
                <span style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>${formatUSDC(totalSupplied)}</span>
              </div>
              <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.05)" }} />

              {/* Utilization bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ color: "#9ca3af", fontSize: "13px" }}>Utilization</span>
                  <span style={{ color: "#4ade80", fontWeight: "600", fontSize: "14px" }}>{utilization.toFixed(2)}%</span>
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

              {/* Collateral summary */}
              {collateralAmount > 0n && (
                <>
                  <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.05)" }} />
                  <div style={{ backgroundColor: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.15)", borderRadius: "10px", padding: "12px 14px" }}>
                    <p style={{ color: "#6b7280", fontSize: "11px", marginBottom: "4px" }}>Your collateral value</p>
                    <p style={{ color: "#22d3ee", fontWeight: "700", fontSize: "18px" }}>
                      ${(parseFloat(collateralFormatted) * 2000).toFixed(2)}
                    </p>
                    <p style={{ color: "#6b7280", fontSize: "11px", marginTop: "2px" }}>
                      {collateralFormatted} WETH @ $2,000
                    </p>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Good to Know card */}
          <div
            style={{
              width: "100%",
              boxSizing: "border-box",
              backgroundColor: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              overflow: "hidden",
              borderTop: "3px solid #4ade80",
            }}
          >
            <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Info size={15} color="#4ade80" />
              <h3 style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>Good to Know</h3>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { icon: "✓", color: "#4ade80", text: "Maximum LTV is 75% — borrow up to $1,500 for every 1 WETH deposited" },
                { icon: "✓", color: "#4ade80", text: "Liquidation threshold is 80% — your position is liquidated if debt exceeds 80% of collateral value" },
                { icon: "✓", color: "#4ade80", text: "Keep health factor above 1.5 to stay safely away from liquidation" },
                { icon: "✓", color: "#4ade80", text: "You must fully repay all debt before withdrawing any collateral" },
                { icon: "!", color: "#eab308", text: "Testnet only. Do not use real funds." },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{ color: item.color, fontSize: "13px", flexShrink: 0, marginTop: "1px", fontWeight: "bold" }}>
                    {item.icon}
                  </span>
                  <p style={{ color: "#9ca3af", fontSize: "13px", lineHeight: 1.65 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tip */}
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
              Your health factor decreases as you borrow more. Keep it above{" "}
              <span style={{ color: "#9ca3af", fontWeight: "600" }}>1.5</span> to avoid
              liquidation risk.
            </p>
          </div>

        </div>
        {/* end right column */}

      </div>
      {/* end two-column layout */}

    </div>
  )
}
