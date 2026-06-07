import { useState } from 'react'
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import type { PageScanData } from '../types'
import ScreenshotOverlay from '../components/ScreenshotOverlay'
import IssuePanel from '../components/IssuePanel'

interface Props {
  pages: PageScanData[]
  onBack: () => void
}

export default function AnalysisPage({ pages, onBack }: Props) {
  const [pageIdx, setPageIdx] = useState(0)
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null)

  const current = pages[pageIdx]
  const isBatch = pages.length > 1

  const handlePageChange = (idx: number) => {
    setPageIdx(idx)
    setSelectedIssue(null)
  }

  const handleSelectIssue = (idx: number) => {
    setSelectedIssue(prev => (prev === idx ? null : idx))
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-[#2A2A2A] bg-[#111] sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-2 text-[#52525B] hover:text-white border border-[#2A2A2A] rounded-lg transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-semibold text-sm">분석 결과</h2>
          <a
            href={current.url}
            target="_blank"
            rel="noreferrer"
            className="text-[#52525B] text-xs hover:text-purple-400 flex items-center gap-1 transition-colors truncate"
          >
            {current.url}
            <ExternalLink size={10} />
          </a>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#52525B]">
          <span>요소 {current.element_count}개</span>
          <span className="text-red-400 font-medium">누락 {current.issues.length}건</span>
        </div>
      </div>

      {/* 배치 페이지 탭 */}
      {isBatch && (
        <div className="flex items-center gap-1 px-6 py-2 border-b border-[#2A2A2A] overflow-x-auto bg-[#111]">
          {pages.map((p, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs transition-all ${
                pageIdx === i
                  ? 'bg-[#2A2A2A] text-white'
                  : 'text-[#52525B] hover:text-[#A1A1AA]'
              }`}
            >
              <span className="truncate max-w-[160px] block">
                {new URL(p.url).pathname || '/'}
              </span>
              {p.issues.length > 0 && (
                <span className="ml-1 text-red-400">({p.issues.length})</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 메인 레이아웃: 스크린샷 좌 + 이슈패널 우 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌: 스크린샷 오버레이 */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#0F0F0F]">
          {current.issues.length > 0 && (
            <p className="text-xs text-[#52525B] mb-3 text-center">
              빨간 박스를 클릭하면 이슈 상세를 확인할 수 있습니다
            </p>
          )}
          <ScreenshotOverlay
            screenshotId={current.screenshot_id}
            originalWidth={current.screenshot_width}
            originalHeight={current.screenshot_height}
            issues={current.issues}
            selectedIndex={selectedIssue}
            onSelect={handleSelectIssue}
          />
        </div>

        {/* 우: 이슈 패널 */}
        <div className="w-80 flex-shrink-0 border-l border-[#2A2A2A] bg-[#111] flex flex-col overflow-hidden">
          <IssuePanel
            issues={current.issues}
            selectedIndex={selectedIssue}
            onSelect={handleSelectIssue}
          />
        </div>
      </div>

      {/* 배치 하단 네비게이션 */}
      {isBatch && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#2A2A2A] bg-[#111] text-sm text-[#52525B]">
          <button
            onClick={() => handlePageChange(pageIdx - 1)}
            disabled={pageIdx === 0}
            className="flex items-center gap-1 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={16} /> 이전
          </button>
          <span>{pageIdx + 1} / {pages.length}</span>
          <button
            onClick={() => handlePageChange(pageIdx + 1)}
            disabled={pageIdx === pages.length - 1}
            className="flex items-center gap-1 hover:text-white disabled:opacity-30 transition-colors"
          >
            다음 <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
