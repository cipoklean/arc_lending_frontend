import { CheckCircle, ExternalLink, X } from "lucide-react"
import { shortenHash } from "../lib/utils"

export default function SuccessBanner({ message, txHash, onClose }) {
  if (!message) return null

  return (
    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
      <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-green-400 text-sm font-medium">{message}</p>
        {txHash && (
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500 text-xs font-mono truncate">
              {shortenHash(txHash)}
            </p>
            <a
              href={`https://testnet.arcscan.app/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-green-400 transition-colors shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
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