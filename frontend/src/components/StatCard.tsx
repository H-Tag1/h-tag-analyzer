interface Props {
  label: string
  value: number
  color: 'white' | 'green' | 'red' | 'amber'
  active?: boolean
  onClick?: () => void
}

const colorMap = {
  white: { value: 'text-white', bg: 'border-[#2A2A2A]', active: 'border-white/20 bg-white/5' },
  green: { value: 'text-emerald-400', bg: 'border-[#2A2A2A]', active: 'border-emerald-800 bg-emerald-900/20' },
  red:   { value: 'text-red-400',     bg: 'border-[#2A2A2A]', active: 'border-red-800 bg-red-900/20' },
  amber: { value: 'text-amber-400',   bg: 'border-[#2A2A2A]', active: 'border-amber-800 bg-amber-900/20' },
}

export default function StatCard({ label, value, color, active, onClick }: Props) {
  const c = colorMap[color]
  return (
    <button
      onClick={onClick}
      className={`bg-[#1A1A1A] border rounded-2xl p-5 text-left w-full transition-all ${active ? c.active : c.bg} ${onClick ? 'hover:border-opacity-60 cursor-pointer' : 'cursor-default'}`}
    >
      <p className={`text-3xl font-bold mb-1 ${c.value}`}>
        {value.toLocaleString()}
      </p>
      <p className="text-[#A1A1AA] text-sm">{label}</p>
    </button>
  )
}
