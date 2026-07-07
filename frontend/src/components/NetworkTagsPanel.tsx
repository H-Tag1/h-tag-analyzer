import { useState } from 'react'
import { ChevronRight, Radio } from 'lucide-react'
import type { NetworkTagHit } from '../types'

interface Props {
  networkTags: NetworkTagHit[]
  selectedIndex: number | null
  onSelect: (index: number) => void
}

function triggerLabel(trigger: string): string {
  return trigger === 'click' ? '클릭' : '페이지 로드'
}

export default function NetworkTagsPanel({ networkTags, selectedIndex, onSelect }: Props) {
  const [filter, setFilter] = useState<'all' | 'page_load' | 'click'>('all')

  const filtered = networkTags
    .map((tag, index) => ({ tag, index }))
    .filter(({ tag }) => filter === 'all' || tag.trigger === filter)

  if (networkTags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#52525B] py-16 px-4">
        <Radio size={32} className="text-[#52525B] mb-3" />
        <p className="text-sm text-center">수집된 GA4 네트워크 태그가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 px-3 py-2 border-b border-[#2A2A2A]">
        {(['all', 'page_load', 'click'] as const).map(value => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-2 py-1 rounded text-[10px] transition-colors ${
              filter === value
                ? 'bg-[#2A2A2A] text-white'
                : 'text-[#52525B] hover:text-[#A1A1AA]'
            }`}
          >
            {value === 'all' ? `전체 (${networkTags.length})` : value === 'page_load' ? '로드' : '클릭'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map(({ tag, index: originalIndex }) => {
          const isSelected = selectedIndex === originalIndex

          return (
            <div
              key={`${tag.event_name ?? 'event'}-${originalIndex}`}
              className={`border-b border-[#2A2A2A] transition-colors ${isSelected ? 'bg-white/[0.03]' : ''}`}
            >
              <button
                onClick={() => onSelect(isSelected ? -1 : originalIndex)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/[0.02]"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    {tag.event_name || '(이름 없음)'}
                  </p>
                  <p className="text-xs text-[#52525B] truncate">{triggerLabel(tag.trigger)}</p>
                </div>
                <ChevronRight
                  size={14}
                  className={`text-[#52525B] flex-shrink-0 transition-transform ${isSelected ? 'rotate-90' : ''}`}
                />
              </button>

              {isSelected && (
                <div className="px-4 pb-4 animate-fade-in">
                  <dl className="space-y-2">
                    {tag.display_fields.map(field => (
                      <div key={field.label}>
                        <dt className="text-[11px] text-[#52525B]">{field.label}</dt>
                        <dd className="text-xs text-[#E4E4E7] break-all mt-0.5">{field.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
