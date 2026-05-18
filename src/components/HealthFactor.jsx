import { getHealthColor, getHealthBgColor, getHealthStatus, formatHealthFactor } from "../lib/utils"
import InfoTooltip from "./InfoTooltip"

export default function HealthFactor({ value }) {
  const hf        = Number(value || 0) / 1e18
  const color     = getHealthColor(value)
  const bgColor   = getHealthBgColor(value)
  const status    = getHealthStatus(value)
  const formatted = formatHealthFactor(value)

  const percentage = hf > 3 ? 100 : (hf / 3) * 100

  const statusStyles = {
    Safe:          { bg: "rgba(74,222,128,0.1)",      text: "#4ade80", border: "1px solid rgba(74,222,128,0.2)"      },
    Warning:       { bg: "rgba(234,179,8,0.1)",       text: "#eab308", border: "1px solid rgba(234,179,8,0.2)"       },
    Danger:        { bg: "rgba(239,68,68,0.1)",       text: "#f87171", border: "1px solid rgba(239,68,68,0.2)"       },
    "No Position": { bg: "rgba(255,255,255,0.05)",    text: "#6b7280", border: "1px solid rgba(255,255,255,0.1)"     },
  }
  const ss = statusStyles[status] || statusStyles["No Position"]

  const colorMap = {
    "text-green-400":  "#4ade80",
    "text-yellow-400": "#eab308",
    "text-red-400":    "#f87171",
    "text-gray-400":   "#9ca3af",
  }
  const bgColorMap = {
    "bg-green-400":  "#4ade80",
    "bg-yellow-400": "#eab308",
    "bg-red-400":    "#f87171",
    "bg-gray-400":   "#9ca3af",
  }

  const numberColor = colorMap[color]    || "#9ca3af"
  const barColor    = bgColorMap[bgColor] || "#9ca3af"

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "20px 22px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h3 style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>Health Factor</h3>
          <InfoTooltip text="Your health factor shows how safe your loan is. Below 1.0 means you can be liquidated. Keep it above 1.5 to stay safe." />
        </div>
        <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "999px", backgroundColor: ss.bg, color: ss.text, border: ss.border, fontWeight: "500" }}>
          {status}
        </span>
      </div>

      {/* Big number — min 2rem, margin-top 20px, margin-bottom 8px before bar */}
      <div
        style={{
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: "bold",
          color: numberColor,
          marginTop: "20px",
          marginBottom: "8px",
          lineHeight: 1,
        }}
      >
        {formatted}
      </div>

      {/* Progress bar */}
      <div style={{ height: "8px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden", marginBottom: "10px" }}>
        <div
          style={{
            height: "100%",
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: barColor,
            borderRadius: "999px",
            transition: "width 0.5s ease",
          }}
        />
      </div>

      {/* Labels */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#f87171", fontSize: "11px" }}>Liquidation &lt; 1.0</span>
        <span style={{ color: "#eab308", fontSize: "11px" }}>Warning &lt; 1.5</span>
        <span style={{ color: "#4ade80", fontSize: "11px" }}>Safe &gt; 1.5</span>
      </div>
    </div>
  )
}