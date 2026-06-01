export default function TokenInput({
  label,
  token,
  value,
  onChange,
  balance,
  maxAmount,
  placeholder = "0.00",
  hint,
}) {
 
  const max = parseFloat(maxAmount) || 0

  function handlePercent(pct) {
    if (!max || max <= 0) return
    const amount = (max * pct) / 100
    onChange(parseFloat(amount.toFixed(6)).toString())
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
        padding: 16,
        width: "100%",
        boxSizing: "border-box",
        transition: "border-color 0.2s ease",
      }}
    >
      {/* Label + Balance row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <label style={{ color: "#9CA3AF", fontSize: "0.75rem", fontWeight: 500 }}>
          {label}
        </label>
        {balance !== undefined && (
          <span style={{ color: "#6B7280", fontSize: "0.75rem" }}>
            Balance: <span style={{ color: "#D1D5DB" }}>{balance}</span>
          </span>
        )}
      </div>

      {/* Input + Token */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <input
          type="number"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "white",
            fontSize: "1.3rem",
            fontWeight: 600,
            minWidth: 0,
            width: "100%",
          }}
        />
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 12px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          flexShrink: 0,
        }}>
          <span style={{ color: "white", fontSize: "0.88rem", fontWeight: 500 }}>{token}</span>
        </div>
      </div>

      {/* Percentage buttons */}
      {maxAmount !== undefined && max > 0 && (
        <div style={{ display: "flex", gap: 6 }}>
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              onClick={() => handlePercent(pct)}
              style={{
                flex: 1,
                padding: "5px 0",
                background: "rgba(74,222,128,0.06)",
                border: "1px solid rgba(74,222,128,0.15)",
                borderRadius: 8,
                color: "#4ade80",
                fontSize: "0.72rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={e => {
                e.target.style.background = "rgba(74,222,128,0.15)"
                e.target.style.borderColor = "rgba(74,222,128,0.35)"
              }}
              onMouseLeave={e => {
                e.target.style.background = "rgba(74,222,128,0.06)"
                e.target.style.borderColor = "rgba(74,222,128,0.15)"
              }}
            >
              {pct === 100 ? "MAX" : `${pct}%`}
            </button>
          ))}
        </div>
      )}

      {/* Hint */}
      {hint && (
        <p style={{ color: "#6B7280", fontSize: "0.75rem", marginTop: 10 }}>{hint}</p>
      )}
    </div>
  )
}
