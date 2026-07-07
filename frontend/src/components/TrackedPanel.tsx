import { Check } from 'lucide-react'
import type { TrackedAnalysisItem } from '../types'
import { normalizeTagSpec } from '../utils/tagSpec'

interface Props {
  trackedItems: TrackedAnalysisItem[]
  selectedIndex: number | null
  onSelect: (index: number) => void
}

const TRACKING_FIELDS = [
  { key: 'event_name' as const, label: '추천 태그' },
  { key: 'ep_button_area' as const, label: 'ep_button_area' },
  { key: 'ep_button_area2' as const, label: 'ep_button_area2' },
  { key: 'ep_button_name' as const, label: 'ep_button_name' },
]

function TrackingParamsTable({ trackingData }: { trackingData: Record<string, unknown> }) {
  const params = normalizeTagSpec(trackingData)

  return (
    <table className="w-full text-xs border-collapse">
      <tbody>
        {TRACKING_FIELDS.map(({ key, label }) => (
          <tr key={key} className="border-b border-[#2A2A2A]/60 last:border-0">
            <td className="py-1.5 pr-2 text-[#52525B] whitespace-nowrap align-top font-mono">
              {label}
            </td>
            <td className="py-1.5 text-white break-all">
              {params[key] || <span className="text-[#52525B]">-</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function TrackedPanel({ trackedItems, selectedIndex, onSelect }: Props) {
  if (trackedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#52525B] py-16">
        <Check size={32} className="text-[#52525B] mb-3" />
        <p className="text-sm">정상 트래킹된 태그가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {trackedItems.map((item, idx) => {
          const isSelected = selectedIndex === idx
          const params = normalizeTagSpec(item.tracking_data)
          const title = item.element_text || params.ep_button_name || params.ep_button_area

          return (
            <div
              key={idx}
              className={`border-b border-[#2A2A2A] transition-colors ${isSelected ? 'bg-white/[0.03]' : ''}`}
            >
              <button
                onClick={() => onSelect(isSelected ? -1 : idx)}
                className="w-full text-left px-4 py-3 hover:bg-white/[0.02]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {title && (
                      <p className="text-sm text-white truncate mb-2">{title}</p>
                    )}
                    <TrackingParamsTable trackingData={item.tracking_data} />
                  </div>
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
