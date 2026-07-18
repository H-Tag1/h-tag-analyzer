import { useMemo, useRef, useState } from 'react'
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import type { AiAnalysisItem, GeneratedCodeSnapshot, PageScanData } from '../types'
import ScreenshotOverlay from '../components/ScreenshotOverlay'
import IssuePanel from '../components/IssuePanel'
import TrackedPanel from '../components/TrackedPanel'
import ExcludedPanel from '../components/ExcludedPanel'
import AllTagsPanel from '../components/AllTagsPanel'
import ReviewPanel from '../components/ReviewPanel'
import { dismissIssue, issueIdentityKey } from '../utils/dismissedIssues'
import { getSavedCodeForPage } from '../utils/scanHistory'
import { getPageChannelLabel } from '../utils/ga4Channel'
import { isPageViewEvent } from '../utils/eventType'
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

type PanelTab = 'missing' | 'review' | 'tracked' | 'excluded' | 'all'

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
  const [selectedReview, setSelectedReview] = useState<number | null>(null)
  const [selectedTracked, setSelectedTracked] = useState<number | null>(null)
  const [selectedExcluded, setSelectedExcluded] = useState<number | null>(null)
  const [selectedAll, setSelectedAll] = useState<number | null>(null)
  const [sessionDismissedKeys, setSessionDismissedKeys] = useState<Set<string>>(new Set())

  const current = pages[pageIdx]
  const reviewItems = current.review_items ?? []
  const interactiveTrackedItems = useMemo(
    () => (current.tracked_items ?? []).filter(
      item => !isPageViewEvent(item.tracking_data?.event_name as string | undefined),
    ),
    [current.tracked_items],
  )
  const excludedItems = current.excluded_items ?? []
  const networkTags = current.network_tags ?? []
  const visibleIssues = useMemo(
    () => current.issues.filter(issue => !sessionDismissedKeys.has(issueIdentityKey(issue))),
    [current.issues, sessionDismissedKeys],
  )
  const isBatch = pages.length > 1

  const clearSecondarySelections = () => {
    setSelectedReview(null)
    setSelectedExcluded(null)
    setSelectedAll(null)
  }

  const handlePageChange = (idx: number) => {
    setPageIdx(idx)
    setSelectedIssue(null)
    setSelectedReview(null)
    setSelectedTracked(null)
    setSelectedExcluded(null)
    setSelectedAll(null)
    setSessionDismissedKeys(new Set())
  }

  const handleSelectIssue = (idx: number) => {
    setPanelTab('missing')
    setSelectedTracked(null)
    clearSecondarySelections()
    setSelectedIssue(idx)
  }

  const handleSelectTracked = (idx: number) => {
    setPanelTab('tracked')
    setSelectedIssue(null)
    clearSecondarySelections()
    setSelectedTracked(idx)
  }

  const handleSelectReview = (idx: number) => {
    setPanelTab('review')
    setSelectedIssue(null)
    setSelectedTracked(null)
    setSelectedExcluded(null)
    setSelectedAll(null)
    setSelectedReview(idx)
  }

  const handleSelectExcluded = (idx: number) => {
    setPanelTab('excluded')
    setSelectedIssue(null)
    setSelectedTracked(null)
    setSelectedReview(null)
    setSelectedAll(null)
    setSelectedExcluded(idx)
  }

  const handlePanelSelectTracked = (idx: number) => {
    setSelectedIssue(null)
    setSelectedReview(null)
    setSelectedExcluded(null)
    setSelectedAll(null)
    setSelectedTracked(prev => (prev === idx ? null : idx))
  }

  const handlePanelSelectIssue = (idx: number) => {
    setSelectedTracked(null)
    setSelectedReview(null)
    setSelectedExcluded(null)
    setSelectedAll(null)
    if (idx < 0) {
      setSelectedIssue(null)
      return
    }
    setSelectedIssue(prev => (prev === idx ? null : idx))
  }

  const handlePanelSelectReview = (idx: number) => {
    setSelectedIssue(null)
    setSelectedTracked(null)
    setSelectedExcluded(null)
    setSelectedAll(null)
    setSelectedReview(prev => (prev === idx ? null : idx))
  }

  const handlePanelSelectExcluded = (idx: number) => {
    setSelectedIssue(null)
    setSelectedTracked(null)
    setSelectedReview(null)
    setSelectedAll(null)
    setSelectedExcluded(prev => (prev === idx ? null : idx))
  }

  const handleDismissIssue = async (issue: AiAnalysisItem, tag: TagSpec) => {
    await dismissIssue(current.url, issue, tag)
    setSessionDismissedKeys(prev => new Set([...prev, issueIdentityKey(issue)]))
    setSelectedIssue(null)
  }

  const savedCodeForPage = getSavedCodeForPage(savedGeneratedCodes, current.url)
  const captureScrollRef = useRef<HTMLDivElement>(null)
  const channelLabel = getPageChannelLabel(current)

  const overlayIssues = panelTab === 'missing' || panelTab === 'all' ? visibleIssues : []
  const overlayReviewItems = panelTab === 'review' || panelTab === 'all' ? reviewItems : []
  const overlayTrackedItems = panelTab === 'tracked' || panelTab === 'all' ? interactiveTrackedItems : []
  const overlayExcludedItems = panelTab === 'excluded' || panelTab === 'all' ? excludedItems : []

  const handlePanelTabChange = (tab: PanelTab) => {
    setPanelTab(tab)
    setSelectedAll(null)
    if (tab === 'missing') {
      setSelectedTracked(null)
      setSelectedReview(null)
      setSelectedExcluded(null)
    } else if (tab === 'review') {
      setSelectedIssue(null)
      setSelectedTracked(null)
      setSelectedExcluded(null)
    } else if (tab === 'tracked') {
      setSelectedIssue(null)
      setSelectedReview(null)
      setSelectedExcluded(null)
    } else if (tab === 'excluded') {
      setSelectedIssue(null)
      setSelectedReview(null)
      setSelectedTracked(null)
    } else {
      setSelectedIssue(null)
      setSelectedReview(null)
      setSelectedTracked(null)
      setSelectedExcluded(null)
    }
  }

  return (
    <div className="h-screen bg-[#0F0F0F] flex flex-col overflow-hidden">
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
          {channelLabel && (
            <span className="px-2 py-0.5 rounded-md bg-[#2A2A2A] text-[#E4E4E7] font-medium">
              {channelLabel}
            </span>
          )}
          <span className="font-mono text-purple-400">{current.tracking_id ?? 'G-1NWKV3S1TW'}</span>
          <span>요소 {current.element_count}개</span>
          <span className="text-blue-400 font-medium">전체 {networkTags.length}건</span>
          <span className="text-emerald-400 font-medium">정상 {interactiveTrackedItems.length}건</span>
          <span className="text-red-400 font-medium">누락 {visibleIssues.length}건</span>
          <span className="text-amber-400 font-medium">확인 {reviewItems.length}건</span>
          <span className="text-orange-400 font-medium">예외 {excludedItems.length}건</span>
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
              {(() => {
                const count = (p.tracked_items ?? []).filter(
                  item => !isPageViewEvent(item.tracking_data?.event_name as string | undefined),
                ).length
                return count > 0 ? (
                  <span className="ml-1 text-emerald-400">({count})</span>
                ) : null
              })()}
              {p.issues.length > 0 && (
                <span className="ml-1 text-red-400">({p.issues.length})</span>
              )}
              {(p.review_items?.length ?? 0) > 0 && (
                <span className="ml-1 text-amber-400">({p.review_items?.length})</span>
              )}
              {(p.excluded_items?.length ?? 0) > 0 && (
                <span className="ml-1 text-orange-400">({p.excluded_items?.length})</span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 flex flex-col p-4 bg-[#0F0F0F]">
          <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-[#2F2F2F] bg-[#141414] shadow-[0_24px_64px_rgba(0,0,0,0.45)] overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[#2A2A2A] bg-[#141414]/95 backdrop-blur-sm">
              <span className="text-xs font-medium text-[#A1A1AA]">화면 캡처</span>
              <div className="flex items-center gap-3 text-[11px] text-[#52525B]">
                {(panelTab === 'tracked' || panelTab === 'all') && interactiveTrackedItems.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded border border-emerald-500/60 bg-emerald-500/15" />
                    정상 {interactiveTrackedItems.length}
                  </span>
                )}
                {(panelTab === 'missing' || panelTab === 'all') && visibleIssues.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded border border-red-500/60 bg-red-500/15" />
                    누락 {visibleIssues.length}
                  </span>
                )}
                {(panelTab === 'review' || panelTab === 'all') && reviewItems.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded border border-amber-500/60 bg-amber-500/15" />
                    확인 {reviewItems.length}
                  </span>
                )}
                {(panelTab === 'excluded' || panelTab === 'all') && excludedItems.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded border border-orange-500/60 bg-orange-500/15" />
                    예외 {excludedItems.length}
                  </span>
                )}
              </div>
            </div>

            <div
              ref={captureScrollRef}
              className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-3"
            >
              <ScreenshotOverlay
                screenshotId={current.screenshot_id}
                originalWidth={current.screenshot_width}
                originalHeight={current.screenshot_height}
                issues={overlayIssues}
                reviewItems={overlayReviewItems}
                trackedItems={overlayTrackedItems}
                excludedItems={overlayExcludedItems}
                selectedIssueIndex={panelTab === 'missing' || panelTab === 'all' ? selectedIssue : null}
                selectedReviewIndex={panelTab === 'review' || panelTab === 'all' ? selectedReview : null}
                selectedTrackedIndex={panelTab === 'tracked' || panelTab === 'all' ? selectedTracked : null}
                selectedExcludedIndex={panelTab === 'excluded' || panelTab === 'all' ? selectedExcluded : null}
                scrollContainerRef={captureScrollRef}
                onSelectIssue={handleSelectIssue}
                onSelectReview={handleSelectReview}
                onSelectTracked={handleSelectTracked}
                onSelectExcluded={handleSelectExcluded}
              />
            </div>
          </div>
        </div>

        <div className="w-80 flex-shrink-0 border-l border-[#2A2A2A] bg-[#111] flex flex-col min-h-0 overflow-hidden">
          <div className="flex border-b border-[#2A2A2A] overflow-x-auto">
            <button
              onClick={() => handlePanelTabChange('all')}
              className={`flex-shrink-0 px-2 py-2.5 text-[11px] font-medium transition-colors ${
                panelTab === 'all'
                  ? 'text-white border-b-2 border-blue-400'
                  : 'text-[#52525B] hover:text-[#A1A1AA]'
              }`}
            >
              전체 ({networkTags.length})
            </button>
            <button
              onClick={() => handlePanelTabChange('missing')}
              className={`flex-shrink-0 px-2 py-2.5 text-[11px] font-medium transition-colors ${
                panelTab === 'missing'
                  ? 'text-white border-b-2 border-red-400'
                  : 'text-[#52525B] hover:text-[#A1A1AA]'
              }`}
            >
              누락 ({visibleIssues.length})
            </button>
            <button
              onClick={() => handlePanelTabChange('tracked')}
              className={`flex-shrink-0 px-2 py-2.5 text-[11px] font-medium transition-colors ${
                panelTab === 'tracked'
                  ? 'text-white border-b-2 border-emerald-400'
                  : 'text-[#52525B] hover:text-[#A1A1AA]'
              }`}
            >
              정상 ({interactiveTrackedItems.length})
            </button>
            <button
              onClick={() => handlePanelTabChange('review')}
              className={`flex-shrink-0 px-2 py-2.5 text-[11px] font-medium transition-colors ${
                panelTab === 'review'
                  ? 'text-white border-b-2 border-amber-400'
                  : 'text-[#52525B] hover:text-[#A1A1AA]'
              }`}
            >
              확인 ({reviewItems.length})
            </button>
            <button
              onClick={() => handlePanelTabChange('excluded')}
              className={`flex-shrink-0 px-2 py-2.5 text-[11px] font-medium transition-colors ${
                panelTab === 'excluded'
                  ? 'text-white border-b-2 border-orange-400'
                  : 'text-[#52525B] hover:text-[#A1A1AA]'
              }`}
            >
              예외 ({excludedItems.length})
            </button>
          </div>

          {panelTab === 'all' ? (
            <div className="flex-1 min-h-0 overflow-hidden">
              <AllTagsPanel
                networkTags={networkTags}
                selectedIndex={selectedAll}
                onSelect={idx => setSelectedAll(prev => (prev === idx ? null : idx))}
              />
            </div>
          ) : panelTab === 'missing' ? (
            <div className="flex-1 min-h-0 overflow-hidden">
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
            </div>
          ) : panelTab === 'review' ? (
            <div className="flex-1 min-h-0 overflow-hidden">
              <ReviewPanel
                reviewItems={reviewItems}
                selectedIndex={selectedReview}
                onSelect={handlePanelSelectReview}
              />
            </div>
          ) : panelTab === 'tracked' ? (
            <div className="flex-1 min-h-0 overflow-hidden">
              <TrackedPanel
                trackedItems={interactiveTrackedItems}
                selectedIndex={selectedTracked}
                onSelect={handlePanelSelectTracked}
              />
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-hidden">
              <ExcludedPanel
                excludedItems={excludedItems}
                selectedIndex={selectedExcluded}
                onSelect={handlePanelSelectExcluded}
              />
            </div>
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
