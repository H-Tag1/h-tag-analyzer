import { useEffect, useRef, useState, type RefObject } from 'react'
import type { AiAnalysisItem, BoundingBox, ExcludedAnalysisItem, TrackedAnalysisItem } from '../types'
import { scrollElementIntoContainerAfterLayout } from '../utils/scrollIntoContainer'

interface Props {
  screenshotId: string
  originalWidth: number
  originalHeight: number
  issues: AiAnalysisItem[]
  reviewItems: AiAnalysisItem[]
  trackedItems: TrackedAnalysisItem[]
  excludedItems?: ExcludedAnalysisItem[]
  selectedIssueIndex: number | null
  selectedReviewIndex: number | null
  selectedTrackedIndex: number | null
  selectedExcludedIndex?: number | null
  scrollContainerRef?: RefObject<HTMLDivElement | null>
  onSelectIssue: (index: number) => void
  onSelectReview: (index: number) => void
  onSelectTracked: (index: number) => void
  onSelectExcluded?: (index: number) => void
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
  excludedItems = [],
  selectedIssueIndex,
  selectedReviewIndex,
  selectedTrackedIndex,
  selectedExcludedIndex = null,
  scrollContainerRef,
  onSelectIssue,
  onSelectReview,
  onSelectTracked,
  onSelectExcluded,
}: Props) {
  const trackedRefs = useRef<(HTMLDivElement | null)[]>([])
  const issueRefs = useRef<(HTMLDivElement | null)[]>([])
  const reviewRefs = useRef<(HTMLDivElement | null)[]>([])
  const excludedRefs = useRef<(HTMLDivElement | null)[]>([])
  const [imageLoaded, setImageLoaded] = useState(false)

  const isMobileScreenshot = originalWidth <= 500
  const maxDisplayWidth = isMobileScreenshot ? Math.min(originalWidth, 430) : undefined

  const getScrollContainer = () => scrollContainerRef?.current ?? null

  useEffect(() => {
    if (!imageLoaded || selectedTrackedIndex === null || selectedTrackedIndex < 0) return

    scrollElementIntoContainerAfterLayout(
      trackedRefs.current[selectedTrackedIndex] ?? null,
      getScrollContainer(),
    )
  }, [selectedTrackedIndex, imageLoaded, screenshotId, scrollContainerRef])

  useEffect(() => {
    if (!imageLoaded || selectedIssueIndex === null || selectedIssueIndex < 0) return

    scrollElementIntoContainerAfterLayout(
      issueRefs.current[selectedIssueIndex] ?? null,
      getScrollContainer(),
    )
  }, [selectedIssueIndex, imageLoaded, screenshotId, scrollContainerRef])

  useEffect(() => {
    if (!imageLoaded || selectedReviewIndex === null || selectedReviewIndex < 0) return

    scrollElementIntoContainerAfterLayout(
      reviewRefs.current[selectedReviewIndex] ?? null,
      getScrollContainer(),
    )
  }, [selectedReviewIndex, imageLoaded, screenshotId, scrollContainerRef])

  useEffect(() => {
    if (!imageLoaded || selectedExcludedIndex === null || selectedExcludedIndex < 0) return

    scrollElementIntoContainerAfterLayout(
      excludedRefs.current[selectedExcludedIndex] ?? null,
      getScrollContainer(),
    )
  }, [selectedExcludedIndex, imageLoaded, screenshotId, scrollContainerRef])

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
          const isGroupInherited = item.verification_source === 'group_inherited'

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
                isGroupInherited
                  ? isSelected
                    ? 'bg-lime-400/30 border-2 border-lime-300 shadow-lg shadow-lime-900/30 z-20'
                    : 'bg-lime-400/15 border border-lime-300/70 hover:bg-lime-400/25 z-10'
                  : isSelected
                    ? 'bg-emerald-500/30 border-2 border-emerald-400 shadow-lg shadow-emerald-900/40 z-20'
                    : 'bg-emerald-500/15 border border-emerald-500/60 hover:bg-emerald-500/25 z-10'
              }`}
            >
              {isSelected && (
                <span className={`absolute -top-5 left-0 text-[10px] bg-[#1A1A1A]/90 px-1 rounded whitespace-nowrap max-w-[180px] truncate pointer-events-none ${
                  isGroupInherited ? 'text-lime-300' : 'text-emerald-400'
                }`}>
                  {item.tracking_data?.event_name as string || item.element_text || item.element_selector}
                </span>
              )}
            </div>
          )
        })}

        {issues.map((item, i) => {
          if (!hasVisibleBox(item.bounding_box)) return null
          const isSelected = selectedIssueIndex === i
          const isGroupInherited = item.verification_source === 'group_inherited'

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
                isGroupInherited
                  ? isSelected
                    ? 'bg-yellow-400/30 border-2 border-yellow-300 shadow-lg shadow-yellow-900/30 z-20'
                    : 'bg-yellow-400/15 border border-yellow-300/70 hover:bg-yellow-400/25 z-10'
                  : isSelected
                    ? 'bg-red-500/30 border-2 border-red-400 shadow-lg shadow-red-900/40 z-20'
                    : 'bg-red-500/15 border border-red-500/60 hover:bg-red-500/25 z-10'
              }`}
            >
              {isSelected && (
                <span className={`absolute -top-5 left-0 text-[10px] bg-[#1A1A1A]/90 px-1 rounded whitespace-nowrap max-w-[180px] truncate pointer-events-none ${
                  isGroupInherited ? 'text-yellow-300' : 'text-red-400'
                }`}>
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
                  {item.recommended_ga_spec?.event_name as string || item.element_text || item.element_selector}
                </span>
              )}
            </div>
          )
        })}

        {excludedItems.map((item, i) => {
          if (!hasVisibleBox(item.bounding_box)) return null
          const isSelected = selectedExcludedIndex === i

          return (
            <div
              key={`excluded-${i}`}
              ref={node => {
                excludedRefs.current[i] = node
              }}
              onClick={event => {
                event.stopPropagation()
                onSelectExcluded?.(i)
              }}
              title={item.exclusion_reason}
              style={{
                position: 'absolute',
                pointerEvents: 'auto',
                ...boxToStyle(item.bounding_box, originalWidth, originalHeight),
              }}
              className={`cursor-pointer rounded transition-all ${
                isSelected
                  ? 'bg-orange-500/30 border-2 border-orange-400 shadow-lg shadow-orange-900/40 z-20'
                  : 'bg-orange-500/15 border border-orange-500/60 hover:bg-orange-500/25 z-10'
              }`}
            >
              {isSelected && (
                <span className="absolute -top-5 left-0 text-[10px] text-orange-400 bg-[#1A1A1A]/90 px-1 rounded whitespace-nowrap max-w-[180px] truncate pointer-events-none">
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
