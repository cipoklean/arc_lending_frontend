import { useState, useEffect } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import Dashboard from "./pages/Dashboard"
import Supply from "./pages/Supply"
import Borrow from "./pages/Borrow"
import Positions from "./pages/Positions"
import { LayoutDashboard, TrendingUp, ArrowDownUp, Wallet, Menu, X } from "lucide-react"
import BridgeButton from "./components/BridgeButton"
import UnifiedBalance from "./components/UnifiedBalance"

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "supply",    label: "Supply",    icon: TrendingUp      },
  { id: "borrow",    label: "Borrow",    icon: ArrowDownUp     },
  { id: "positions", label: "Positions", icon: Wallet          },
]

export default function App() {
  const [activePage, setActivePage]         = useState("dashboard")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  /* listen for arc:navigate events fired by child pages */
  useEffect(() => {
    function handleNavigate(e) {
      setActivePage(e.detail)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
    window.addEventListener("arc:navigate", handleNavigate)
    return () => window.removeEventListener("arc:navigate", handleNavigate)
  }, [])

  /* render the active page */
  function renderPage() {
    if (activePage === "dashboard") return <Dashboard />
    if (activePage === "supply")    return <Supply />
    if (activePage === "borrow")    return <Borrow />
    if (activePage === "positions") return <Positions />
    return <Dashboard />
  }

  /* nav click handler */
  function handleNav(id) {
    setActivePage(id)
    setMobileMenuOpen(false)
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#080b0f",
        color: "white",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >

      {/* ── HEADER ── */}
      <header
        style={{
          width: "100%",
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          backgroundColor: "rgba(8,11,15,0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* NAV — full width */}
        <nav style={{ width: "100%", maxWidth: "100%" }}>

          {/* Inner wrapper */}
          <div
            style={{
              width: "100%",
              maxWidth: "1400px",
              margin: "0 auto",
              padding: "0 32px",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              height: "64px",
            }}
          >

            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #4ade80, #22d3ee)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  color: "black",
                  fontSize: "14px",
                  flexShrink: 0,
                }}
              >
                AL
              </div>
              <div>
                <div style={{ color: "white", fontWeight: "bold", fontSize: "16px", lineHeight: 1 }}>
                  Arclen
                </div>
                <div style={{ color: "#6b7280", fontSize: "12px", marginTop: "2px" }}>
                  Testnet
                </div>
              </div>
            </div>

            {/* Desktop nav links */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                flex: 1,
                justifyContent: "center",
              }}
            >
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = activePage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 18px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: "500",
                      border: isActive
                        ? "1px solid rgba(74,222,128,0.3)"
                        : "1px solid transparent",
                      backgroundColor: isActive
                        ? "rgba(74,222,128,0.1)"
                        : "transparent",
                      color: isActive ? "#4ade80" : "#9ca3af",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                )
              })}
            </div>

            {/* Right side — Bridge + UnifiedBalance + wallet + hamburger */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              <UnifiedBalance />
              <BridgeButton />
              <ConnectButton />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  padding: "8px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "transparent",
                  color: "#9ca3af",
                  cursor: "pointer",
                }}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

          </div>
        </nav>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div
            style={{
              width: "100%",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              backgroundColor: "rgba(8,11,15,0.98)",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "1400px",
                margin: "0 auto",
                padding: "12px 32px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = activePage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: "500",
                      border: isActive
                        ? "1px solid rgba(74,222,128,0.3)"
                        : "1px solid transparent",
                      backgroundColor: isActive
                        ? "rgba(74,222,128,0.1)"
                        : "transparent",
                      color: isActive ? "#4ade80" : "#9ca3af",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                )
              })}

              {/* Mobile Bridge + Unified Balance */}
              <div style={{
                display: "flex", gap: 10, padding: "8px 0",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                marginTop: 4,
              }}>
                <UnifiedBalance />
                <BridgeButton />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT ── */}
      <main
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "32px 32px 80px",
          boxSizing: "border-box",
          flex: 1,
        }}
      >
        {renderPage()}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ width: "100%", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div
          style={{
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "32px",
            boxSizing: "border-box",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "6px",
                background: "linear-gradient(135deg, #4ade80, #22d3ee)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: "black",
                fontSize: "10px",
              }}
            >
              AL
            </div>
            <span style={{ color: "#9ca3af", fontWeight: "500", fontSize: "13px" }}>
              Arclen Protocol
            </span>
          </div>
          <p style={{ color: "#4b5563", fontSize: "12px" }}>
            Built on Arc Testnet &middot; USDC Native Gas
          </p>
          <p style={{ color: "#4b5563", fontSize: "12px", marginTop: "4px", opacity: 0.6 }}>
            This is a testnet deployment for demonstration purposes only
          </p>
        </div>
      </footer>

    </div>
  )
}
