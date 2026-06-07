import { useRef, useEffect, useState } from 'react'
import type { AiAnalysisItem } from '../types'

interface Props {
  screenshotId: string
  originalWidth: number
  originalHeight: number
  issues: AiAnalysisItem[]
  selectedIndex: number | null
  onSelect: (index: number) => void
}

export default function ScreenshotOverlay({
  screenshotId,
  originalWidth,
  issues,
  selectedIndex,
  onSelect,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

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
    <div ref={containerRef} className="relative w-full">
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

      {issues.map((item, i) => {
        const { x, y, width, height } = item.bounding_box
        const isSelected = selectedIndex === i

        return (
          <div
            key={i}
            onClick={() => onSelect(i)}
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
