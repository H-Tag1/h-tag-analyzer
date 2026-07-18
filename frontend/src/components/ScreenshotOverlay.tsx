import { useEffect, useRef, useState, type RefObject } from 'react'
import type { AiAnalysisItem, BoundingBox, TrackedAnalysisItem } from '../types'
import { scrollElementIntoContainerAfterLayout } from '../utils/scrollIntoContainer'

interface Props {
  screenshotId: string
  originalWidth: number
  originalHeight: number
  issues: AiAnalysisItem[]
  reviewItems: AiAnalysisItem[]
  trackedItems: TrackedAnalysisItem[]
  selectedIssueIndex: number | null
  selectedReviewIndex: number | null
  selectedTrackedIndex: number | null
  scrollContainerRef?: RefObject<HTMLDivElement | null>
  onSelectIssue: (index: number) => void
  onSelectReview: (index: number) => void
  onSelectTracked: (index: number) => void
}

function hasVisibleBox(box: BoundingBox): boolean {
  return box.width > 0 && box.height > 0
}

function isNormalizedBox(box: BoundingBox): boolean {
  return box.x <= 1 && box.y <= 1 && box.width <= 1 && box.height <= 1
}

function boxToStyle(box: BoundingBox, imageWidth: number, imageHeight: number) {
  if (isNormalizedBox(box)) {
    return {
      left: `${box.x * 100}%`,
      top: `${box.y * 100}%`,
      width: `${box.width * 100}%`,
      height: `${box.height * 100}%`,
    }
  }

  const toPercent = (value: number, total: number) =>
    total > 0 ? `${(value / total) * 100}%` : '0%'

  return {
    left: toPercent(box.x, imageWidth),
    top: toPercent(box.y, imageHeight),
    width: toPercent(box.width, imageWidth),
    height: toPercent(box.height, imageHeight),
  }
}

export default function ScreenshotOverlay({
  screenshotId,
  originalWidth,
  originalHeight,
  issues,
  reviewItems,
  trackedItems,
  selectedIssueIndex,
  selectedReviewIndex,
  selectedTrackedIndex,
  scrollContainerRef,
  onSelectIssue,
  onSelectReview,
  onSelectTracked,
}: Props) {
  const trackedRefs = useRef<(HTMLDivElement | null)[]>([])
  const issueRefs = useRef<(HTMLDivElement | null)[]>([])
  const reviewRefs = useRef<(HTMLDivElement | null)[]>([])
  const [imageLoaded, setImageLoaded] = useState(false)

  const isMobileScreenshot = originalWidth <= 500
  const maxDisplayWidth = isMobileScreenshot ? Math.min(originalWidth, 430) : undefined

  useEffect(() => {
    if (!imageLoaded || selectedTrackedIndex === null || selectedTrackedIndex < 0) return

    scrollElementIntoContainerAfterLayout(
      trackedRefs.current[selectedTrackedIndex] ?? null,
      scrollContainerRef?.current ?? null,
    )
  }, [selectedTrackedIndex, imageLoaded, screenshotId, scrollContainerRef])

  useEffect(() => {
    if (!imageLoaded || selectedIssueIndex === null || selectedIssueIndex < 0) return

    scrollElementIntoContainerAfterLayout(
      issueRefs.current[selectedIssueIndex] ?? null,
      scrollContainerRef?.current ?? null,
    )
  }, [selectedIssueIndex, imageLoaded, screenshotId, scrollContainerRef])

  useEffect(() => {
    if (!imageLoaded || selectedReviewIndex === null || selectedReviewIndex < 0) return

    scrollElementIntoContainerAfterLayout(
      reviewRefs.current[selectedReviewIndex] ?? null,
      scrollContainerRef?.current ?? null,
    )
  }, [selectedReviewIndex, imageLoaded, screenshotId, scrollContainerRef])

  return (
    <div
      className={`relative w-full ${isMobileScreenshot ? 'mx-auto' : ''}`}
      style={maxDisplayWidth ? { maxWidth: maxDisplayWidth } : undefined}
    >
      <img
        src={`/api/screenshots/${screenshotId}`}
        alt="Page screenshot"
        className="w-full h-auto block rounded-lg ring-1 ring-white/5"
        onLoad={() => setImageLoaded(true)}
        draggable={false}
      />

      <div className="absolute inset-0 pointer-events-none">
        {trackedItems.map((item, i) => {
          if (!hasVisibleBox(item.bounding_box)) return null
          const isSelected = selectedTrackedIndex === i

          return (
            <div
              key={`tracked-${i}`}
              ref={node => {
                trackedRefs.current[i] = node
              }}
              onClick={event => {
                event.stopPropagation()
                onSelectTracked(i)
              }}
              title={item.tracking_description}
              style={{
                position: 'absolute',
                pointerEvents: 'auto',
                ...boxToStyle(item.bounding_box, originalWidth, originalHeight),
              }}
              className={`cursor-pointer rounded transition-all ${
                isSelected
                  ? 'bg-emerald-500/30 border-2 border-emerald-400 shadow-lg shadow-emerald-900/40 z-20'
                  : 'bg-emerald-500/15 border border-emerald-500/60 hover:bg-emerald-500/25 z-10'
              }`}
            >
              {isSelected && (
                <span className="absolute -top-5 left-0 text-[10px] text-emerald-400 bg-[#1A1A1A]/90 px-1 rounded whitespace-nowrap max-w-[180px] truncate pointer-events-none">
                  {item.tracking_data?.event_name as string || item.element_text || item.element_selector}
                </span>
              )}
            </div>
          )
        })}

        {issues.map((item, i) => {
          if (!hasVisibleBox(item.bounding_box)) return null
          const isSelected = selectedIssueIndex === i

          return (
            <div
              key={`issue-${i}`}
              ref={node => {
                issueRefs.current[i] = node
              }}
              onClick={event => {
                event.stopPropagation()
                onSelectIssue(i)
              }}
              title={item.issue}
              style={{
                position: 'absolute',
                pointerEvents: 'auto',
                ...boxToStyle(item.bounding_box, originalWidth, originalHeight),
              }}
              className={`cursor-pointer rounded transition-all ${
                isSelected
                  ? 'bg-red-500/30 border-2 border-red-400 shadow-lg shadow-red-900/40 z-20'
                  : 'bg-red-500/15 border border-red-500/60 hover:bg-red-500/25 z-10'
              }`}
            >
              {isSelected && (
                <span className="absolute -top-5 left-0 text-[10px] text-red-400 bg-[#1A1A1A]/90 px-1 rounded whitespace-nowrap max-w-[180px] truncate pointer-events-none">
                  {item.recommended_ga_spec?.event_name as string || item.element_text || item.element_selector}
                </span>
              )}
            </div>
          )
        })}

        {reviewItems.map((item, i) => {
          if (!hasVisibleBox(item.bounding_box)) return null
          const isSelected = selectedReviewIndex === i

          return (
            <div
              key={`review-${i}`}
              ref={node => {
                reviewRefs.current[i] = node
              }}
              onClick={event => {
                event.stopPropagation()
                onSelectReview(i)
              }}
              title={item.issue}
              style={{
                position: 'absolute',
                pointerEvents: 'auto',
                ...boxToStyle(item.bounding_box, originalWidth, originalHeight),
              }}
              className={`cursor-pointer rounded transition-all ${
                isSelected
                  ? 'bg-amber-500/30 border-2 border-amber-400 shadow-lg shadow-amber-900/40 z-20'
                  : 'bg-amber-500/15 border border-amber-500/60 hover:bg-amber-500/25 z-10'
              }`}
            >
              {isSelected && (
                <span className="absolute -top-5 left-0 max-w-[180px] truncate whitespace-nowrap rounded bg-[#1A1A1A]/90 px-1 text-[10px] text-amber-400 pointer-events-none">
                  {item.element_text || item.element_selector}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
