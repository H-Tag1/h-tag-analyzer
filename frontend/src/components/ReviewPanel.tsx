import { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import type { AiAnalysisItem } from '../types'
import { scrollElementIntoContainerAfterLayout } from '../utils/scrollIntoContainer'

interface Props {
  reviewItems: AiAnalysisItem[]
  selectedIndex: number | null
  onSelect: (index: number) => void
}

export default function ReviewPanel({ reviewItems, selectedIndex, onSelect }: Props) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedIndex === null || selectedIndex < 0) return
    scrollElementIntoContainerAfterLayout(
      itemRefs.current[selectedIndex] ?? null,
      listRef.current,
    )
  }, [selectedIndex])

  if (reviewItems.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 py-16 text-center text-[#52525B]">
        <AlertTriangle size={30} className="mb-3" />
        <p className="text-sm">추가 확인이 필요한 항목이 없습니다.</p>
      </div>
    )
  }

  return (
    <div ref={listRef} className="h-full overflow-y-auto">
      {reviewItems.map((item, index) => {
        const isSelected = selectedIndex === index
        const title = item.element_text || item.element_selector
        const score = typeof item.rag_score === 'number' ? item.rag_score.toFixed(2) : null

        return (
          <button
            key={`${item.element_selector}-${item.element_text}-${index}`}
            ref={node => {
              itemRefs.current[index] = node
            }}
            type="button"
            onClick={() => onSelect(index)}
            className={`w-full border-b border-[#2A2A2A] border-l-2 px-4 py-3 text-left transition-colors ${
              isSelected
                ? 'border-l-amber-400 bg-amber-500/10'
                : 'border-l-transparent hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-amber-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white" title={title}>{title}</p>
                <p className="mt-1 text-xs leading-5 text-[#71717A]">{item.issue}</p>
                {score && (
                  <span className="mt-2 inline-block rounded border border-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300">
                    RAG 유사도 {score}
                  </span>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
