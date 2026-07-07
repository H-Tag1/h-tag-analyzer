import { useRef, useEffect, useState } from 'react'
import type { AiAnalysisItem, TrackedAnalysisItem } from '../types'

interface Props {
  screenshotId: string
  originalWidth: number
  originalHeight: number
  issues: AiAnalysisItem[]
  trackedItems: TrackedAnalysisItem[]
  selectedIssueIndex: number | null
  selectedTrackedIndex: number | null
  onSelectIssue: (index: number) => void
  onSelectTracked: (index: number) => void
}

export default function ScreenshotOverlay({
  screenshotId,
  originalWidth,
  issues,
  trackedItems,
  selectedIssueIndex,
  selectedTrackedIndex,
  onSelectIssue,
  onSelectTracked,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const isMobileScreenshot = originalWidth <= 500
  const maxDisplayWidth = isMobileScreenshot ? Math.min(originalWidth, 430) : undefined

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setScale(containerRef.current.offsetWidth / originalWidth)
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [originalWidth])

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isMobileScreenshot ? 'mx-auto' : ''}`}
      style={maxDisplayWidth ? { maxWidth: maxDisplayWidth } : undefined}
    >
      <img
        src={`/api/screenshots/${screenshotId}`}
        alt="Page screenshot"
        className="w-full block rounded-lg"
        onLoad={() => {
          if (containerRef.current) {
            setScale(containerRef.current.offsetWidth / originalWidth)
          }
        }}
      />

      {trackedItems.map((item, i) => {
        const { x, y, width, height } = item.bounding_box
        const isSelected = selectedTrackedIndex === i

        return (
          <div
            key={`tracked-${i}`}
            onClick={() => onSelectTracked(i)}
            title={item.tracking_description}
            style={{
              position: 'absolute',
              left: x * scale,
              top: y * scale,
              width: width * scale,
              height: height * scale,
            }}
            className={`cursor-pointer rounded transition-all ${
              isSelected
                ? 'bg-emerald-500/30 border-2 border-emerald-400 shadow-lg shadow-emerald-900/40'
                : 'bg-emerald-500/15 border border-emerald-500/60 hover:bg-emerald-500/25'
            }`}
          >
            {isSelected && (
              <span className="absolute -top-5 left-0 text-xs text-emerald-400 bg-[#1A1A1A] px-1 rounded whitespace-nowrap max-w-[200px] truncate">
                {item.element_text || item.element_selector}
              </span>
            )}
          </div>
        )
      })}

      {issues.map((item, i) => {
        const { x, y, width, height } = item.bounding_box
        const isSelected = selectedIssueIndex === i

        return (
          <div
            key={`issue-${i}`}
            onClick={() => onSelectIssue(i)}
            title={item.issue}
            style={{
              position: 'absolute',
              left: x * scale,
              top: y * scale,
              width: width * scale,
              height: height * scale,
            }}
            className={`cursor-pointer rounded transition-all ${
              isSelected
                ? 'bg-red-500/30 border-2 border-red-400 shadow-lg shadow-red-900/40'
                : 'bg-red-500/15 border border-red-500/60 hover:bg-red-500/25'
            }`}
          >
            {isSelected && (
              <span className="absolute -top-5 left-0 text-xs text-red-400 bg-[#1A1A1A] px-1 rounded whitespace-nowrap max-w-[200px] truncate">
                {item.element_text || item.element_selector}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
