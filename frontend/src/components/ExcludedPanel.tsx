import { useEffect, useRef } from 'react'
import { Ban } from 'lucide-react'
import type { ExcludedAnalysisItem } from '../types'
import { scrollElementIntoContainerAfterLayout } from '../utils/scrollIntoContainer'

interface Props {
  excludedItems: ExcludedAnalysisItem[]
  selectedIndex: number | null
  onSelect: (index: number) => void
}

export default function ExcludedPanel({ excludedItems, selectedIndex, onSelect }: Props) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedIndex === null || selectedIndex < 0) return

    scrollElementIntoContainerAfterLayout(
      itemRefs.current[selectedIndex] ?? null,
      listRef.current,
    )
  }, [selectedIndex])

  if (excludedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#52525B] py-16 px-4 text-center">
        <Ban size={32} className="text-[#52525B] mb-3" />
        <p className="text-sm">AI가 마케팅 트래킹 불필요로 판단한 요소가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto">
        {excludedItems.map((item, idx) => {
          const isSelected = selectedIndex === idx
          const title = item.element_text || item.element_selector

          return (
            <div
              key={idx}
              ref={node => {
                itemRefs.current[idx] = node
              }}
              className={`border-b border-[#2A2A2A] transition-colors ${
                isSelected ? 'bg-orange-500/10 border-l-2 border-l-orange-400' : 'border-l-2 border-l-transparent'
              }`}
            >
              <button
                onClick={() => onSelect(idx)}
                className="w-full text-left px-4 py-3 hover:bg-white/[0.02]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {title && (
                      <p className="text-sm text-white truncate mb-1">{title}</p>
                    )}
                    <p className="text-xs text-[#71717A] font-mono truncate mb-2">{item.element_selector}</p>
                    <p className="text-xs text-orange-200/80 leading-relaxed">{item.exclusion_reason}</p>
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
