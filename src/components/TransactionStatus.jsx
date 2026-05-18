import { CheckCircle, Loader, ExternalLink } from "lucide-react"
import { shortenHash } from "../lib/utils"

export default function TransactionStatus({ hash, isConfirming, isConfirmed, onClose }) {
  if (!hash) return null

  return (
    <div className="mt-4 bg-white/[0.03] border border-white/10 rounded-xl p-4">
      {isConfirming && (
        <div className="flex items-center gap-3">
          <Loader className="w-4 h-4 text-yellow-400 animate-spin shrink-0" />
          <div>
            <p className="text-yellow-400 text-sm font-medium">
              Transaction Pending
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              Waiting for confirmation on Arc Testnet...
            </p>
          </div>
        </div>
      )}
      {isConfirmed && (
        <div className="flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          <div className="flex-1">
            <p className="text-green-400 text-sm font-medium">
              Transaction Confirmed!
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              Your transaction was successful
            </p>
          </div>
          <a
            href={`https://testnet.arcscan.app/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
      <p className="text-gray-600 text-xs mt-2 font-mono">
        {shortenHash(hash)}
      </p>
    </div>
  )
}