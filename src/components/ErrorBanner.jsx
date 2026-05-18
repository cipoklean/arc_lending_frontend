import { AlertCircle, X } from "lucide-react"

export default function ErrorBanner({ message, onClose }) {
  if (!message) return null

  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-red-400 text-sm font-medium">Transaction Failed</p>
        <p className="text-gray-400 text-xs mt-0.5">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
