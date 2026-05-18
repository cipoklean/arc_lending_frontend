import { useState } from "react"
import { HelpCircle } from "lucide-react"

export default function InfoTooltip({ text }) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-gray-500 hover:text-gray-300 transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-800 border border-white/10 rounded-xl p-3 text-xs text-gray-300 leading-relaxed z-50 shadow-xl">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 border-r border-b border-white/10 rotate-45 -mt-1" />
        </div>
      )}
    </div>
  )
}