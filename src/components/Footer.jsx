export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 mt-16 text-center text-xs text-gray-600">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center font-bold text-black text-xs">
          AL
        </div>
        <span className="text-gray-400 font-medium">Arc Lending Protocol</span>
      </div>
      <p>Built on Arc Testnet &middot; USDC Native Gas</p>
      <p className="mt-1 opacity-60">
        This is a testnet deployment for demonstration purposes only
      </p>
    </footer>
  )
}