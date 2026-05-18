import { Loader, CheckCircle } from "lucide-react"

export default function ActionButton({
  onClick,
  disabled,
  loading,
  success,
  label,
  loadingLabel,
  color = "green",
}) {
  const colors = {
    green: "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20",
    cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20",
    yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20",
    red: "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20",
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full py-3.5 rounded-xl border font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${colors[color]}`}
    >
      {loading ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          {loadingLabel || "Processing..."}
        </>
      ) : (
        label
      )}
    </button>
  )
}
