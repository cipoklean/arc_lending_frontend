import { ConnectButton } from "@rainbow-me/rainbowkit"
import { LayoutDashboard, ArrowDownUp, Wallet, TrendingUp } from "lucide-react"

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "supply", label: "Supply", icon: TrendingUp },
  { id: "borrow", label: "Borrow", icon: ArrowDownUp },
  { id: "positions", label: "Positions", icon: Wallet },
]

export default function Header({ activePage, setActivePage }) {
  return (
    <header className="border-b border-white/10 bg-[#080b0f]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center font-bold text-black text-sm">
            AL
          </div>
          <div className="hidden sm:block">
            <h1 className="text-white font-bold text-base leading-none">
              Arc Lending
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Testnet
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Wallet Connect */}
        <ConnectButton />

      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          )
        })}
      </div>
    </header>
  )
}