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
  function handleMax() {
    if (maxAmount !== undefined) {
      onChange(String(maxAmount))
    }
  }

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 focus-within:border-green-500/40 transition-all w-full">
      <div className="flex items-center justify-between mb-2 gap-2">
        <label className="text-xs text-gray-400 font-medium shrink-0">{label}</label>
        {balance !== undefined && (
          <span className="text-xs text-gray-500 truncate text-right">
            Balance: <span className="text-gray-300">{balance}</span>
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <input
          type="number"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-white text-lg sm:text-xl font-semibold placeholder-gray-600 focus:outline-none min-w-0 w-full"
        />
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {maxAmount !== undefined && (
            <button
              onClick={handleMax}
              className="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all font-medium whitespace-nowrap"
            >
              MAX
            </button>
          )}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <span className="text-white text-sm font-medium">{token}</span>
          </div>
        </div>
      </div>
      {hint && (
        <p className="text-xs text-gray-500 mt-2">{hint}</p>
      )}
    </div>
  )
}