import { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import type { TrackedAnalysisItem } from '../types'
import TagParamsTable from './TagParamsTable'
import { normalizeTagSpec } from '../utils/tagSpec'
import { scrollElementIntoContainerAfterLayout } from '../utils/scrollIntoContainer'

interface Props {
  trackedItems: TrackedAnalysisItem[]
  selectedIndex: number | null
  onSelect: (index: number) => void
}

export default function TrackedPanel({ trackedItems, selectedIndex, onSelect }: Props) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedIndex === null || selectedIndex < 0) return

    scrollElementIntoContainerAfterLayout(
      itemRefs.current[selectedIndex] ?? null,
      listRef.current,
    )
  }, [selectedIndex])

  if (trackedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#52525B] py-16">
        <Check size={32} className="text-[#52525B] mb-3" />
        <p className="text-sm">click_ 이벤트 중 ep 파라미터가 모두 있는 태그가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto">
        {trackedItems.map((item, idx) => {
          const isSelected = selectedIndex === idx
          const params = normalizeTagSpec(item.tracking_data)
          const title = params.event_name || item.element_text || params.ep_button_name

          return (
            <div
              key={idx}
              ref={node => {
                itemRefs.current[idx] = node
              }}
              className={`border-b border-[#2A2A2A] transition-colors ${
                isSelected ? 'bg-emerald-500/10 border-l-2 border-l-emerald-400' : 'border-l-2 border-l-transparent'
              }`}
            >
              <button
                onClick={() => onSelect(idx)}
                className="w-full text-left px-4 py-3 hover:bg-white/[0.02]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {title && (
                      <p className="text-sm text-white truncate mb-2">{title}</p>
                    )}
                    <TagParamsTable trackingData={item.tracking_data} />
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
