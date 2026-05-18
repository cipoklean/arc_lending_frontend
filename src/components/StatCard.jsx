export default function StatCard({ title, value, subtitle, icon, color = "green" }) {
  const colors = {
    green: "from-green-400/10 to-green-500/5 border-green-500/20",
    cyan: "from-cyan-400/10 to-cyan-500/5 border-cyan-500/20",
    purple: "from-purple-400/10 to-purple-500/5 border-purple-500/20",
    yellow: "from-yellow-400/10 to-yellow-500/5 border-yellow-500/20",
  }

  const iconColors = {
    green: "text-green-400",
    cyan: "text-cyan-400",
    purple: "text-purple-400",
    yellow: "text-yellow-400",
  }

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-4 sm:p-5 w-full`}>
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <p className="text-gray-400 text-xs sm:text-sm font-medium">{title}</p>
        {icon && (
          <span className={`${iconColors[color]} opacity-60`}>
            {icon}
          </span>
        )}
      </div>
      <p className="text-white text-xl sm:text-2xl font-bold mb-1 break-all">{value}</p>
      {subtitle && (
        <p className="text-gray-500 text-xs">{subtitle}</p>
      )}
    </div>
  )
}