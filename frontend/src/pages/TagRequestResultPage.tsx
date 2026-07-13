import { useRef, useState } from 'react'
import { ArrowLeft, AlertCircle, CheckCircle2, ExternalLink, FileSpreadsheet, XCircle } from 'lucide-react'
import type { BoundingBox, TagRequestSheetResult, TagRequestValidationItem, TagRequestValidationResponse } from '../types'
import { scrollElementIntoContainerAfterLayout } from '../utils/scrollIntoContainer'

interface Props {
  result: TagRequestValidationResponse
  onBack: () => void
}

type PanelTab = 'all' | 'missing' | 'normal'

const PARAM_LABELS: Record<string, string> = {
  event_name: '이벤트명',
  ep_button_area: 'ep_button_area',
  ep_button_area2: 'ep_button_area2',
  ep_button_name: 'ep_button_name',
  scan_error: '검사 오류',
}

function hasVisibleBox(box?: BoundingBox | null): box is BoundingBox {
  return Boolean(box && box.width > 0 && box.height > 0)
}

function boxToStyle(box: BoundingBox, imageWidth: number, imageHeight: number) {
  const toPercent = (value: number, total: number) =>
    total > 0 ? `${(value / total) * 100}%` : '0%'

  return {
    left: toPercent(box.x, imageWidth),
    top: toPercent(box.y, imageHeight),
    width: toPercent(box.width, imageWidth),
    height: toPercent(box.height, imageHeight),
  }
}

function statusLabel(item: TagRequestValidationItem) {
  return item.status === 'normal' ? '정상' : '누락'
}

function statusClasses(item: TagRequestValidationItem) {
  return item.status === 'normal'
    ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-300'
    : 'border-red-500/20 bg-red-950/10 text-red-300'
}

function itemTitle(item: TagRequestValidationItem) {
  return item.request.ep_button_name || item.request.ep_button_area2 || item.request.event_name
}

function filteredItems(sheet: TagRequestSheetResult, tab: PanelTab) {
  if (tab === 'missing') return sheet.items.filter(item => item.status === 'missing')
  if (tab === 'normal') return sheet.items.filter(item => item.status === 'normal')
  return sheet.items
}

function MissingFields({ fields }: { fields: string[] }) {
  if (!fields.length) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {fields.map(field => (
        <span key={field} className="rounded border border-red-500/20 bg-red-950/30 px-2 py-1 text-[11px] text-red-200">
          {PARAM_LABELS[field] ?? field}
        </span>
      ))}
    </div>
  )
}

export default function TagRequestResultPage({ result, onBack }: Props) {
  const [sheetIdx, setSheetIdx] = useState(0)
  const [panelTab, setPanelTab] = useState<PanelTab>('missing')
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null)
  const captureScrollRef = useRef<HTMLDivElement>(null)
  const overlayRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const current = result.sheets[sheetIdx] ?? null
  const visibleItems = current ? filteredItems(current, panelTab) : []

  if (!current) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center text-[#52525B]">
        <div className="text-center">
          <AlertCircle size={28} className="mx-auto mb-3 text-red-300" />
          <p className="mb-4 text-sm">검증할 요청 시트를 찾지 못했습니다.</p>
          <button onClick={onBack} className="text-sm hover:text-white transition-colors">
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  const isMobileScreenshot = current.screenshot_width > 0 && current.screenshot_width <= 500
  const maxDisplayWidth = isMobileScreenshot ? Math.min(current.screenshot_width, 430) : undefined

  const handleSheetChange = (idx: number) => {
    setSheetIdx(idx)
    setPanelTab('missing')
    setSelectedItemKey(null)
  }

  const handleSelectItem = (item: TagRequestValidationItem) => {
    const key = keyOf(item)
    setSelectedItemKey(prev => {
      const next = prev === key ? null : key
      if (next) {
        window.requestAnimationFrame(() => {
          scrollElementIntoContainerAfterLayout(overlayRefs.current[next] ?? null, captureScrollRef.current)
        })
      }
      return next
    })
  }

  return (
    <div className="h-screen bg-[#0F0F0F] flex flex-col overflow-hidden">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-[#2A2A2A] bg-[#111] sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-2 text-[#52525B] hover:text-white border border-[#2A2A2A] rounded-lg transition-all"
          aria-label="돌아가기"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-semibold text-sm">요청서 검증 결과</h2>
          <p className="text-[#52525B] text-xs truncate">{result.file_name}</p>
          {current?.url && (
            <a
              href={current.url}
              target="_blank"
              rel="noreferrer"
              className="text-[#71717A] text-xs hover:text-purple-400 flex items-center gap-1 transition-colors truncate"
            >
              {current.url}
              <ExternalLink size={10} />
            </a>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-[#52525B]">
          <span>요소 {current?.element_count ?? 0}개</span>
          <span className="text-blue-400 font-medium">전체 {result.total_count}건</span>
          <span className="text-emerald-400 font-medium">정상 {result.normal_count}건</span>
          <span className="text-red-400 font-medium">누락 {result.missing_count}건</span>
        </div>
      </header>

      {result.sheets.length > 1 && (
        <div className="flex items-center gap-1 px-6 py-2 border-b border-[#2A2A2A] overflow-x-auto bg-[#111]">
          {result.sheets.map((sheet, i) => (
            <button
              key={sheet.sheet_name}
              onClick={() => handleSheetChange(i)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs transition-all ${
                sheetIdx === i
                  ? 'bg-[#2A2A2A] text-white'
                  : 'text-[#52525B] hover:text-[#A1A1AA]'
              }`}
            >
              <span className="truncate max-w-[220px] inline-flex items-center gap-1.5">
                <FileSpreadsheet size={12} />
                {sheet.sheet_name}
              </span>
              {sheet.normal_count > 0 && <span className="ml-1 text-emerald-400">({sheet.normal_count})</span>}
              {sheet.missing_count > 0 && <span className="ml-1 text-red-400">({sheet.missing_count})</span>}
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
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded border border-emerald-500/60 bg-emerald-500/15" />
                  정상 {current.normal_count}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded border border-red-500/60 bg-red-500/15" />
                  누락 {current.missing_count}
                </span>
              </div>
            </div>

            <div ref={captureScrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-3">
              {current.error ? (
                <div className="flex h-full items-center justify-center text-red-300">
                  <div className="max-w-md text-center">
                    <AlertCircle size={28} className="mx-auto mb-3" />
                    <p className="text-sm">{current.error}</p>
                  </div>
                </div>
              ) : current.screenshot_id ? (
                <div
                  className={`relative w-full ${isMobileScreenshot ? 'mx-auto' : ''}`}
                  style={maxDisplayWidth ? { maxWidth: maxDisplayWidth } : undefined}
                >
                  <img
                    src={`/api/screenshots/${current.screenshot_id}`}
                    alt="Page screenshot"
                    className="w-full h-auto block rounded-lg ring-1 ring-white/5"
                    draggable={false}
                  />
                  <div className="absolute inset-0 pointer-events-none">
                    {current.items.map(item => {
                      if (!hasVisibleBox(item.bounding_box)) return null
                      const key = keyOf(item)
                      const isSelected = selectedItemKey === key
                      const isNormal = item.status === 'normal'
                      return (
                        <div
                          key={key}
                          ref={node => {
                            overlayRefs.current[key] = node
                          }}
                          onClick={event => {
                            event.stopPropagation()
                            handleSelectItem(item)
                          }}
                          title={itemTitle(item)}
                          style={{
                            position: 'absolute',
                            pointerEvents: 'auto',
                            ...boxToStyle(item.bounding_box, current.screenshot_width, current.screenshot_height),
                          }}
                          className={`cursor-pointer rounded transition-all ${
                            isNormal
                              ? isSelected
                                ? 'bg-emerald-500/30 border-2 border-emerald-400 shadow-lg shadow-emerald-900/40 z-20'
                                : 'bg-emerald-500/15 border border-emerald-500/60 hover:bg-emerald-500/25 z-10'
                              : isSelected
                                ? 'bg-red-500/30 border-2 border-red-400 shadow-lg shadow-red-900/40 z-20'
                                : 'bg-red-500/15 border border-red-500/60 hover:bg-red-500/25 z-10'
                          }`}
                        >
                          <span className={`absolute -top-5 left-0 text-[10px] bg-[#1A1A1A]/90 px-1 rounded whitespace-nowrap max-w-[180px] truncate pointer-events-none ${
                            isNormal ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {item.request.request_no}. {itemTitle(item)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-[#52525B]">
                  <p className="text-sm">화면 캡처가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="w-80 flex-shrink-0 border-l border-[#2A2A2A] bg-[#111] flex flex-col min-h-0 overflow-hidden">
          <div className="flex border-b border-[#2A2A2A]">
            {([
              ['all', `전체 (${current.total_count})`, 'border-blue-400'],
              ['missing', `누락 (${current.missing_count})`, 'border-red-400'],
              ['normal', `정상 (${current.normal_count})`, 'border-emerald-400'],
            ] as const).map(([tab, label, border]) => (
              <button
                key={tab}
                onClick={() => {
                  setPanelTab(tab)
                  setSelectedItemKey(null)
                }}
                className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
                  panelTab === tab
                    ? `text-white border-b-2 ${border}`
                    : 'text-[#52525B] hover:text-[#A1A1AA]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {visibleItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-4 py-16 text-center text-[#52525B]">
                <CheckCircle2 size={28} className="mb-3" />
                <p className="text-sm">표시할 항목이 없습니다.</p>
              </div>
            ) : (
              visibleItems.map(item => {
                const key = keyOf(item)
                const isSelected = selectedItemKey === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectItem(item)}
                    className={`w-full border-b border-[#2A2A2A] px-4 py-3 text-left transition-colors ${
                      isSelected ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs ${statusClasses(item)}`}>
                        {item.status === 'normal' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {statusLabel(item)}
                      </span>
                      <span className="text-xs text-[#71717A]">요청 {item.request.request_no}</span>
                      {!item.bounding_box && <span className="ml-auto text-[10px] text-[#52525B]">화면 위치 없음</span>}
                    </div>
                    <p className="truncate text-sm font-medium text-white">{itemTitle(item)}</p>
                    <p className="mt-1 truncate font-mono text-xs text-[#71717A]">{item.request.event_name}</p>
                    <dl className="mt-3 space-y-1.5 text-xs">
                      {[
                        ['ep_button_area', item.request.ep_button_area],
                        ['ep_button_area2', item.request.ep_button_area2],
                        ['ep_button_name', item.request.ep_button_name],
                      ].map(([label, value]) => (
                        <div key={label} className="grid grid-cols-[96px_1fr] gap-2">
                          <dt className="text-[#52525B]">{label}</dt>
                          <dd className="truncate text-[#E4E4E7]" title={value}>{value || '-'}</dd>
                        </div>
                      ))}
                    </dl>
                    <MissingFields fields={item.missing_fields} />
                  </button>
                )
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function keyOf(item: TagRequestValidationItem) {
  return `${item.request.sheet_name}-${item.request.request_no}-${item.request.row_number}`
}
