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

function eventCategory(eventName?: string | null): string {
  const name = (eventName || '').toLowerCase()
  if (name.startsWith('click_')) return '클릭'
  if (name.includes('purchase') || name.includes('cart') || name.includes('checkout') || name.startsWith('view_item')) {
    return '전자상거래'
  }
  if (name === 'page_view' || name === 'session_start') return '페이지'
  return '기타'
}

export default function AllTagsPanel({ networkTags, selectedIndex, onSelect }: Props) {
  const [filter, setFilter] = useState<'all' | 'click' | 'page' | 'ecommerce'>('all')

  const filtered = networkTags
    .map((tag, index) => ({ tag, index }))
    .filter(({ tag }) => {
      if (filter === 'all') return true
      const category = eventCategory(tag.event_name)
      if (filter === 'click') return category === '클릭'
      if (filter === 'page') return category === '페이지'
      return category === '전자상거래'
    })

  if (networkTags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#52525B] py-16 px-4">
        <Radio size={32} className="text-[#52525B] mb-3" />
        <p className="text-sm text-center">수집된 GA4 태그가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-[#2A2A2A]">
        {([
          ['all', `전체 (${networkTags.length})`],
          ['click', '클릭'],
          ['page', '페이지'],
          ['ecommerce', '전자상거래'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-2 py-1 rounded text-[10px] transition-colors ${
              filter === value
                ? 'bg-[#2A2A2A] text-white'
                : 'text-[#52525B] hover:text-[#A1A1AA]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map(({ tag, index: originalIndex }) => {
          const isSelected = selectedIndex === originalIndex
          const category = eventCategory(tag.event_name)

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
                  <p className="text-xs text-[#52525B] truncate">
                    {category} · {triggerLabel(tag.trigger)}
                  </p>
                </div>
                <ChevronRight
                  size={14}
                  className={`text-[#52525B] flex-shrink-0 transition-transform ${isSelected ? 'rotate-90' : ''}`}
                />
              </button>

              {isSelected && (
                <div className="px-4 pb-4 animate-fade-in">
                  {(tag.ep_button_area || tag.ep_button_area2 || tag.ep_button_name) && (
                    <dl className="space-y-2 mb-3 pb-3 border-b border-[#2A2A2A]">
                      {[
                        ['ep_button_area', tag.ep_button_area],
                        ['ep_button_area2', tag.ep_button_area2],
                        ['ep_button_name', tag.ep_button_name],
                      ].map(([label, value]) => value ? (
                        <div key={label}>
                          <dt className="text-[11px] text-[#52525B] font-mono">{label}</dt>
                          <dd className="text-xs text-[#E4E4E7] break-all mt-0.5">{value}</dd>
                        </div>
                      ) : null)}
                    </dl>
                  )}
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
