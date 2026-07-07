import { useMemo, useState } from 'react'
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import type { AiAnalysisItem, GeneratedCodeSnapshot, PageScanData } from '../types'
import ScreenshotOverlay from '../components/ScreenshotOverlay'
import IssuePanel from '../components/IssuePanel'
import TrackedPanel from '../components/TrackedPanel'
import AllTagsPanel from '../components/AllTagsPanel'
import { dismissIssue, issueIdentityKey } from '../utils/dismissedIssues'
import { getSavedCodeForPage } from '../utils/scanHistory'
import type { TagSpec } from '../utils/tagSpec'

interface Props {
  pages: PageScanData[]
  onBack: () => void
  historyId?: string | null
  savedGeneratedCodes?: GeneratedCodeSnapshot[]
  title?: string
  subtitle?: string
  onGeneratedCodesChange?: (codes: GeneratedCodeSnapshot[]) => void
}

type PanelTab = 'missing' | 'tracked' | 'all'

export default function AnalysisPage({
  pages,
  onBack,
  historyId = null,
  savedGeneratedCodes,
  title = '분석 결과',
  subtitle,
  onGeneratedCodesChange,
}: Props) {
  const [pageIdx, setPageIdx] = useState(0)
  const [panelTab, setPanelTab] = useState<PanelTab>('missing')
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null)
  const [selectedTracked, setSelectedTracked] = useState<number | null>(null)
  const [selectedAll, setSelectedAll] = useState<number | null>(null)
  const [sessionDismissedKeys, setSessionDismissedKeys] = useState<Set<string>>(new Set())

  const current = pages[pageIdx]
  const trackedItems = current.tracked_items ?? []
  const networkTags = current.network_tags ?? []
  const visibleIssues = useMemo(
    () => current.issues.filter(issue => !sessionDismissedKeys.has(issueIdentityKey(issue))),
    [current.issues, sessionDismissedKeys],
  )
  const isBatch = pages.length > 1

  const handlePageChange = (idx: number) => {
    setPageIdx(idx)
    setSelectedIssue(null)
    setSelectedTracked(null)
    setSelectedAll(null)
    setSessionDismissedKeys(new Set())
  }

  const handleSelectIssue = (idx: number) => {
    setPanelTab('missing')
    setSelectedTracked(null)
    setSelectedIssue(prev => (prev === idx ? null : idx))
  }

  const handleSelectTracked = (idx: number) => {
    setPanelTab('tracked')
    setSelectedIssue(null)
    setSelectedTracked(prev => (prev === idx ? null : idx))
  }

  const handlePanelSelectIssue = (idx: number) => {
    setSelectedTracked(null)
    setSelectedIssue(prev => (prev === idx ? null : idx))
  }

  const handlePanelSelectTracked = (idx: number) => {
    setSelectedIssue(null)
    setSelectedTracked(prev => (prev === idx ? null : idx))
  }

  const handleDismissIssue = async (issue: AiAnalysisItem, tag: TagSpec) => {
    await dismissIssue(current.url, issue, tag)
    setSessionDismissedKeys(prev => new Set([...prev, issueIdentityKey(issue)]))
    setSelectedIssue(null)
  }

  const savedCodeForPage = getSavedCodeForPage(savedGeneratedCodes, current.url)

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-[#2A2A2A] bg-[#111] sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-2 text-[#52525B] hover:text-white border border-[#2A2A2A] rounded-lg transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-semibold text-sm">{title}</h2>
          {subtitle ? (
            <div className="min-w-0">
              <p className="text-[#52525B] text-xs truncate">{subtitle}</p>
              <a
                href={current.url}
                target="_blank"
                rel="noreferrer"
                className="text-[#71717A] text-xs hover:text-purple-400 flex items-center gap-1 transition-colors truncate"
              >
                {current.url}
                <ExternalLink size={10} />
              </a>
            </div>
          ) : (
            <a
              href={current.url}
              target="_blank"
              rel="noreferrer"
              className="text-[#52525B] text-xs hover:text-purple-400 flex items-center gap-1 transition-colors truncate"
            >
              {current.url}
              <ExternalLink size={10} />
            </a>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-[#52525B]">
          <span className="font-mono text-purple-400">{current.tracking_id ?? 'G-1NWKV3S1TW'}</span>
          <span>요소 {current.element_count}개</span>
          <span className="text-blue-400 font-medium">전체 {networkTags.length}건</span>
          <span className="text-emerald-400 font-medium">정상 {trackedItems.length}건</span>
          <span className="text-red-400 font-medium">누락 {visibleIssues.length}건</span>
        </div>
      </div>

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
              {(p.tracked_items?.length ?? 0) > 0 && (
                <span className="ml-1 text-emerald-400">({p.tracked_items.length})</span>
              )}
              {p.issues.length > 0 && (
                <span className="ml-1 text-red-400">({p.issues.length})</span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 bg-[#0F0F0F]">
          {(visibleIssues.length > 0 || trackedItems.length > 0) && (
            <div className="flex items-center justify-center gap-4 text-xs text-[#52525B] mb-3">
              {trackedItems.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded border border-emerald-500/60 bg-emerald-500/15" />
                  초록: 정상 트래킹
                </span>
              )}
              {visibleIssues.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded border border-red-500/60 bg-red-500/15" />
                  빨강: 태그 누락
                </span>
              )}
            </div>
          )}
          <ScreenshotOverlay
            screenshotId={current.screenshot_id}
            originalWidth={current.screenshot_width}
            originalHeight={current.screenshot_height}
            issues={visibleIssues}
            trackedItems={trackedItems}
            selectedIssueIndex={selectedIssue}
            selectedTrackedIndex={selectedTracked}
            onSelectIssue={handleSelectIssue}
            onSelectTracked={handleSelectTracked}
          />
        </div>

        <div className="w-80 flex-shrink-0 border-l border-[#2A2A2A] bg-[#111] flex flex-col overflow-hidden">
          <div className="flex border-b border-[#2A2A2A]">
            <button
              onClick={() => setPanelTab('all')}
              className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
                panelTab === 'all'
                  ? 'text-white border-b-2 border-blue-400'
                  : 'text-[#52525B] hover:text-[#A1A1AA]'
              }`}
            >
              전체 ({networkTags.length})
            </button>
            <button
              onClick={() => setPanelTab('missing')}
              className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
                panelTab === 'missing'
                  ? 'text-white border-b-2 border-red-400'
                  : 'text-[#52525B] hover:text-[#A1A1AA]'
              }`}
            >
              누락 ({visibleIssues.length})
            </button>
            <button
              onClick={() => setPanelTab('tracked')}
              className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
                panelTab === 'tracked'
                  ? 'text-white border-b-2 border-emerald-400'
                  : 'text-[#52525B] hover:text-[#A1A1AA]'
              }`}
            >
              정상 ({trackedItems.length})
            </button>
          </div>

          {panelTab === 'all' ? (
            <AllTagsPanel
              networkTags={networkTags}
              selectedIndex={selectedAll}
              onSelect={idx => setSelectedAll(prev => (prev === idx ? null : idx))}
            />
          ) : panelTab === 'missing' ? (
            <IssuePanel
              key={pageIdx}
              issues={visibleIssues}
              selectedIndex={selectedIssue}
              onSelect={handlePanelSelectIssue}
              onDismiss={handleDismissIssue}
              historyId={historyId}
              pageUrl={current.url}
              initialGeneratedCode={savedCodeForPage}
              onGeneratedCodesChange={onGeneratedCodesChange}
            />
          ) : (
            <TrackedPanel
              trackedItems={trackedItems}
              selectedIndex={selectedTracked}
              onSelect={handlePanelSelectTracked}
            />
          )}
        </div>
      </div>

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
