import { useAccount } from "wagmi"
import { useProtocol } from "../hooks/useProtocol"
import { useUserData } from "../hooks/useUserData"
import HealthFactor from "../components/HealthFactor"
import { formatUSDC, formatWETH } from "../lib/utils"
import { Activity, Zap, AlertCircle, TrendingUp, ArrowDownUp, Shield } from "lucide-react"

function StatCard({ title, value, subtitle, color = "green" }) {
  const styles = {
    green:  { border: "1px solid rgba(74,222,128,0.2)",  bg: "rgba(74,222,128,0.05)"  },
    cyan:   { border: "1px solid rgba(34,211,238,0.2)",  bg: "rgba(34,211,238,0.05)"  },
    purple: { border: "1px solid rgba(168,85,247,0.2)",  bg: "rgba(168,85,247,0.05)"  },
    yellow: { border: "1px solid rgba(234,179,8,0.2)",   bg: "rgba(234,179,8,0.05)"   },
  }
  const s = styles[color] || styles.green
  return (
    <div style={{ border: s.border, backgroundColor: s.bg, borderRadius: "16px", padding: "24px", width: "100%", boxSizing: "border-box" }}>
      <p style={{ color: "#9ca3af", fontSize: "13px", fontWeight: "500", marginBottom: "10px" }}>{title}</p>
      <p style={{ color: "white", fontSize: "26px", fontWeight: "bold", marginBottom: "4px", wordBreak: "break-all", lineHeight: 1.2 }}>{value}</p>
      {subtitle && <p style={{ color: "#6b7280", fontSize: "12px", marginTop: "6px" }}>{subtitle}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { isConnected } = useAccount()
  const { totalSupplied, totalBorrowed, supplyAPY, borrowAPY, utilization, isLoading } = useProtocol()
  const { supplyBalance, supplyAmount, totalDebt, healthFactor, collateralAmount, usdcBalance, wethBalance } = useUserData()

  return (
    <div style={{ width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "32px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "40px" }}>

      {/* ── HERO — no card, no border, no background ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          boxSizing: "border-box",
          padding: "48px 0 48px 28px",
        }}
      >
        {/* Green left border accent — standalone decoration only */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "4px",
            borderRadius: "4px",
            background: "linear-gradient(180deg, #4ade80, #22d3ee)",
          }}
        />

        {/* Powered by pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 14px",
            borderRadius: "999px",
            backgroundColor: "rgba(74,222,128,0.1)",
            border: "1px solid rgba(74,222,128,0.2)",
            color: "#4ade80",
            fontSize: "12px",
            fontWeight: "500",
            marginBottom: "20px",
          }}
        >
          <Zap size={11} />
          Powered by Arc Testnet &middot; USDC Native Gas
        </div>

        {/* Left-aligned title */}
        <h1
          style={{
            fontSize: "clamp(30px, 4vw, 56px)",
            fontWeight: "bold",
            color: "white",
            marginBottom: "16px",
            lineHeight: 1.15,
            textAlign: "left",
            maxWidth: "700px",
          }}
        >
          Lend and Borrow on{" "}
          <span style={{ background: "linear-gradient(90deg, #4ade80, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Arc Network
          </span>
        </h1>

        {/* Left-aligned subtitle */}
        <p style={{ color: "#9ca3af", fontSize: "17px", lineHeight: 1.75, textAlign: "left", maxWidth: "560px" }}>
          Supply USDC to earn yield or deposit WETH as collateral to borrow.
          Sub-second finality, stablecoin-native gas on Arc Testnet.
        </p>
      </div>

      {/* ── PROTOCOL STATS ── */}
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <Activity size={18} color="#4ade80" />
          <h2 style={{ color: "white", fontWeight: "600", fontSize: "18px" }}>Protocol Overview</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", width: "100%", boxSizing: "border-box" }}>
          <StatCard title="Total Supplied" value={isLoading ? "..." : `$${formatUSDC(totalSupplied)}`} subtitle="USDC in pool"           color="green"  />
          <StatCard title="Total Borrowed" value={isLoading ? "..." : `$${formatUSDC(totalBorrowed)}`} subtitle="USDC borrowed"          color="cyan"   />
          <StatCard title="Supply APY"     value={isLoading ? "..." : `${supplyAPY.toFixed(4)}%`}       subtitle="Grows with utilization"  color="purple" />
          <StatCard title="Borrow APY"     value={isLoading ? "..." : `${borrowAPY.toFixed(2)}%`}       subtitle="Annual rate"             color="yellow" />
        </div>
      </div>

      {/* ── POOL UTILIZATION ── */}
      <div style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "24px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h3 style={{ color: "white", fontWeight: "600", fontSize: "15px" }}>Pool Utilization</h3>
          <span style={{ color: "#4ade80", fontWeight: "bold", fontSize: "15px" }}>{utilization.toFixed(2)}%</span>
        </div>
        <div style={{ height: "12px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden", width: "100%" }}>
          <div style={{ height: "100%", width: `${Math.min(utilization, 100)}%`, background: "linear-gradient(90deg, #4ade80, #22d3ee)", borderRadius: "999px", transition: "width 0.5s ease", minWidth: utilization > 0 ? "6px" : "0" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          <span style={{ color: "#6b7280", fontSize: "12px" }}>0%</span>
          <span style={{ color: "#6b7280", fontSize: "12px" }}>Optimal 80%</span>
          <span style={{ color: "#6b7280", fontSize: "12px" }}>100%</span>
        </div>
        <p style={{ color: "#6b7280", fontSize: "12px", marginTop: "10px" }}>
          Supply APY increases as more USDC is borrowed. Currently{" "}
          <span style={{ color: "#9ca3af" }}>{utilization.toFixed(2)}%</span> of pool is borrowed.
        </p>
      </div>

      {/* ── YOUR POSITION ── */}
      {isConnected ? (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap size={18} color="#4ade80" />
            <h2 style={{ color: "white", fontWeight: "600", fontSize: "18px" }}>Your Position</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", width: "100%", boxSizing: "border-box" }}>
            <StatCard title="Your Supply Balance" value={`$${formatUSDC(supplyBalance > 0n ? supplyBalance : supplyAmount)}`} subtitle="USDC supplied + interest" color="green"  />
            <StatCard title="Your Debt"            value={`$${formatUSDC(totalDebt)}`}                                          subtitle="USDC borrowed + interest" color="cyan"   />
            <StatCard title="Your Collateral"      value={`${formatWETH(collateralAmount)} WETH`}                               subtitle="Deposited as collateral"  color="purple" />
          </div>
          {totalDebt > 0n && <HealthFactor value={healthFactor} />}
          <div style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "24px", boxSizing: "border-box" }}>
            <h3 style={{ color: "white", fontWeight: "600", fontSize: "15px", marginBottom: "16px" }}>Wallet Balances</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", width: "100%" }}>
              <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "18px" }}>
                <p style={{ color: "#9ca3af", fontSize: "12px", marginBottom: "6px" }}>USDC Balance</p>
                <p style={{ color: "white", fontWeight: "bold", fontSize: "20px" }}>{formatUSDC(usdcBalance)}</p>
                <p style={{ color: "#6b7280", fontSize: "12px" }}>USD Coin</p>
              </div>
              <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "18px" }}>
                <p style={{ color: "#9ca3af", fontSize: "12px", marginBottom: "6px" }}>WETH Balance</p>
                <p style={{ color: "white", fontWeight: "bold", fontSize: "20px" }}>{formatWETH(wethBalance)}</p>
                <p style={{ color: "#6b7280", fontSize: "12px" }}>Wrapped Ether</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "60px 24px", textAlign: "center", boxSizing: "border-box" }}>
          <div style={{ width: "68px", height: "68px", borderRadius: "18px", backgroundColor: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <AlertCircle size={30} color="#4ade80" />
          </div>
          <h3 style={{ color: "white", fontWeight: "600", fontSize: "20px", marginBottom: "10px" }}>Connect Your Wallet</h3>
          <p style={{ color: "#9ca3af", fontSize: "15px", maxWidth: "360px", margin: "0 auto 12px", lineHeight: 1.7 }}>
            Connect your wallet to view your positions, supply USDC, or borrow against your collateral.
          </p>
          <p style={{ color: "#4b5563", fontSize: "13px" }}>Supports MetaMask, Coinbase Wallet, Rainbow and more</p>
        </div>
      )}

      {/* ── HOW IT WORKS ── */}
      <div style={{ width: "100%" }}>
        <h2 style={{ color: "white", fontWeight: "600", fontSize: "18px", marginBottom: "20px" }}>How It Works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", width: "100%", boxSizing: "border-box" }}>
          {[
            { step: "01", icon: <TrendingUp size={22} color="#4ade80" />, title: "Supply USDC",        desc: "Deposit USDC into the lending pool and earn interest automatically. Withdraw anytime.",                       color: "#4ade80", border: "rgba(74,222,128,0.2)",  bg: "rgba(74,222,128,0.06)"  },
            { step: "02", icon: <Shield     size={22} color="#22d3ee" />, title: "Deposit Collateral", desc: "Deposit WETH as collateral. Your collateral secures your loan and protects the protocol.",                    color: "#22d3ee", border: "rgba(34,211,238,0.2)",  bg: "rgba(34,211,238,0.06)"  },
            { step: "03", icon: <ArrowDownUp size={22} color="#a855f7" />,title: "Borrow USDC",        desc: "Borrow up to 75% of your collateral value. Repay anytime to get your collateral back.",                      color: "#a855f7", border: "rgba(168,85,247,0.2)", bg: "rgba(168,85,247,0.06)" },
          ].map((item) => (
            <div
              key={item.step}
              style={{ position: "relative", width: "100%", boxSizing: "border-box", backgroundColor: "rgba(255,255,255,0.02)", border: `1px solid ${item.border}`, borderRadius: "16px", padding: "28px 24px 24px 28px", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${item.color}, transparent)` }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", border: `1px solid ${item.border}`, backgroundColor: item.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: "12px", fontWeight: "700", color: item.color, opacity: 0.7, letterSpacing: "0.05em" }}>STEP {item.step}</span>
              </div>
              <h3 style={{ color: "white", fontWeight: "600", fontSize: "16px", marginBottom: "10px" }}>{item.title}</h3>
              <p style={{ color: "#9ca3af", fontSize: "13px", lineHeight: 1.75 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
