import { useState } from 'react'
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import type { SelectorResult, StatusFilter } from '../types'

interface Props {
  results: SelectorResult[]
  filter: StatusFilter
  onAiClick: (item: SelectorResult) => void
}

const PAGE_SIZE = 50

const statusBadge = (status: string) => {
  if (status === 'OK')      return <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-900/30 text-emerald-400 border border-emerald-900/50">OK</span>
  if (status === 'MISSING') return <span className="px-2 py-0.5 rounded-full text-xs bg-red-900/30 text-red-400 border border-red-900/50">MISSING</span>
  return <span className="px-2 py-0.5 rounded-full text-xs bg-amber-900/30 text-amber-400 border border-amber-900/50">ERROR</span>
}

export default function SelectorTable({ results, filter, onAiClick }: Props) {
  const [page, setPage] = useState(1)

  const filtered = filter === 'ALL' ? results : results.filter(r => r.status === filter)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const goPage = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)))

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 text-[#52525B]">
        해당하는 셀렉터가 없습니다.
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-[#2A2A2A]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] text-[#52525B] text-xs">
              <th className="text-left px-4 py-3 font-medium">셀렉터</th>
              <th className="text-left px-4 py-3 font-medium w-48">이벤트명</th>
              <th className="text-left px-4 py-3 font-medium w-40">영역</th>
              <th className="text-center px-4 py-3 font-medium w-24">상태</th>
              <th className="text-center px-4 py-3 font-medium w-16">요소 수</th>
              <th className="text-center px-4 py-3 font-medium w-20">AI추천</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((item, i) => (
              <tr key={i} className="border-b border-[#2A2A2A] last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 max-w-xs">
                  <p className="font-mono-selector text-[#A1A1AA] truncate" title={item.selector}>
                    {item.selector}
                  </p>
                </td>
                <td className="px-4 py-3 text-[#A1A1AA] truncate max-w-[192px]" title={item.eventName}>
                  {item.eventName}
                </td>
                <td className="px-4 py-3 text-[#A1A1AA] truncate max-w-[160px]">
                  {item.area} &gt; {item.area2}
                </td>
                <td className="px-4 py-3 text-center">{statusBadge(item.status)}</td>
                <td className="px-4 py-3 text-center text-[#52525B]">
                  {item.status === 'OK' ? item.matchCount : '-'}
                </td>
                <td className="px-4 py-3 text-center">
                  {item.status === 'MISSING' && (
                    <button
                      onClick={() => onAiClick(item)}
                      className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 rounded-lg transition-all"
                      title="AI 추천 받기"
                    >
                      <Sparkles size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-[#52525B]">
            {filtered.length.toLocaleString()}개 중 {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => goPage(page - 1)} disabled={page === 1} className="p-1 text-[#52525B] hover:text-white disabled:opacity-30">
              <ChevronLeft size={18} />
            </button>
            <span className="text-white">{page} / {totalPages}</span>
            <button onClick={() => goPage(page + 1)} disabled={page === totalPages} className="p-1 text-[#52525B] hover:text-white disabled:opacity-30">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
