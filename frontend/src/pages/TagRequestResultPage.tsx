import { useRef, useState } from 'react'
import { ArrowLeft, AlertCircle, CheckCircle2, ChevronDown, ExternalLink, FileSpreadsheet, XCircle } from 'lucide-react'
import type {
  BoundingBox,
  TagRequestCandidateResult,
  TagRequestSheetResult,
  TagRequestValidationItem,
  TagRequestValidationResponse,
} from '../types'
import { scrollElementIntoContainerAfterLayout } from '../utils/scrollIntoContainer'

interface Props {
  result: TagRequestValidationResponse
  onBack: () => void
}

type PanelTab = 'all' | 'missing' | 'review' | 'normal'

const PARAM_LABELS: Record<string, string> = {
  event_name: '이벤트명',
  ep_button_area: 'ep_button_area',
  ep_button_area2: 'ep_button_area2',
  ep_button_name: 'ep_button_name',
  scan_error: '검사 오류',
  click_unavailable: '클릭 확인 불가',
  dom_candidate: '대상 요소 없음',
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
  if (item.status === 'normal') return '정상'
  if (item.status === 'review') return '확인 필요'
  return '누락'
}

function statusClasses(item: TagRequestValidationItem) {
  if (item.status === 'normal') {
    return 'border-emerald-500/20 bg-emerald-950/10 text-emerald-300'
  }
  if (item.status === 'review') {
    return 'border-amber-500/20 bg-amber-950/10 text-amber-300'
  }
  return 'border-red-500/20 bg-red-950/10 text-red-300'
}

function candidateStatusClasses(status: TagRequestCandidateResult['status']) {
  if (status === 'normal') return 'border-emerald-500/20 bg-emerald-950/10 text-emerald-300'
  if (status === 'review') return 'border-amber-500/20 bg-amber-950/10 text-amber-300'
  return 'border-red-500/20 bg-red-950/10 text-red-300'
}

function itemTitle(item: TagRequestValidationItem) {
  return item.matched_tag?.ep_button_name || item.request.ep_button_name || item.request.ep_button_area2 || item.request.event_name
}

function filteredItems(sheet: TagRequestSheetResult, tab: PanelTab) {
  if (tab === 'missing') return sheet.items.filter(item => item.status === 'missing')
  if (tab === 'review') return sheet.items.filter(item => item.status === 'review')
  if (tab === 'normal') return sheet.items.filter(item => item.status === 'normal')
  return sheet.items
}

function defaultPanelTab(sheet?: TagRequestSheetResult | null): PanelTab {
  if (!sheet) return 'missing'
  if (sheet.missing_count > 0) return 'missing'
  if ((sheet.review_count ?? 0) > 0) return 'review'
  return 'normal'
}

function screenshotSegments(sheet: TagRequestSheetResult) {
  if (sheet.screenshot_segments?.length) {
    return [...sheet.screenshot_segments].sort((a, b) => a.offset_y - b.offset_y)
  }
  if (!sheet.screenshot_id) return []
  return [{
    screenshot_id: sheet.screenshot_id,
    offset_y: 0,
    width: sheet.screenshot_width,
    height: sheet.screenshot_height,
  }]
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

function ParamComparison({ item }: { item: TagRequestValidationItem }) {
  return (
    <div className="mt-3 space-y-2 text-xs">
      {[
        ['ep_button_area', item.request.ep_button_area, item.matched_tag?.ep_button_area],
        ['ep_button_area2', item.request.ep_button_area2, item.matched_tag?.ep_button_area2],
        ['ep_button_name', item.request.ep_button_name, item.matched_tag?.ep_button_name],
      ].map(([label, expected, actual]) => (
        <div key={label} className="rounded-lg bg-[#101010] px-3 py-2">
          <dt className="mb-1 text-[#52525B]">{label}</dt>
          <dd className="space-y-1">
            <div className="grid grid-cols-[44px_1fr] gap-2">
              <span className="text-[#71717A]">문서</span>
              <span className="truncate text-[#E4E4E7]" title={expected}>{expected || '-'}</span>
            </div>
            <div className="grid grid-cols-[44px_1fr] gap-2">
              <span className="text-[#71717A]">실제</span>
              <span className={actual ? 'truncate text-emerald-300' : 'text-[#52525B]'} title={actual}>
                {actual || '-'}
              </span>
            </div>
          </dd>
        </div>
      ))}
    </div>
  )
}

function RequestExamples({ item }: { item: TagRequestValidationItem }) {
  const examples = Object.entries(item.request.examples ?? {})
    .filter(([, values]) => values.length > 0)
  if (!examples.length) return null

  return (
    <div className="mt-3 rounded-lg border border-[#2A2A2A] bg-[#101010] px-3 py-2 text-xs">
      <p className="mb-2 text-[11px] text-[#71717A]">문서 예시</p>
      <dl className="space-y-1.5">
        {examples.map(([field, values]) => (
          <div key={field} className="grid grid-cols-[88px_1fr] gap-2">
            <dt className="truncate text-[#52525B]" title={field}>{field}</dt>
            <dd className="break-all text-[#D4D4D8]">{values.join(', ')}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Substitutions({ item }: { item: TagRequestValidationItem }) {
  if (!item.substitutions.length) return null

  return (
    <div className="mt-3 rounded-lg border border-purple-500/20 bg-purple-950/10 px-3 py-2">
      <p className="mb-2 text-[11px] text-purple-300">치환값</p>
      <div className="space-y-1">
        {item.substitutions.map((substitution, index) => (
          <div key={`${substitution.field}-${substitution.placeholder}-${index}`} className="grid grid-cols-[88px_1fr] gap-2 text-xs">
            <span className="truncate text-[#A78BFA]" title={substitution.placeholder}>
              {substitution.placeholder}
            </span>
            <span className="truncate text-[#E4E4E7]" title={substitution.value}>
              {substitution.value || '-'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CandidateCoverage({ item }: { item: TagRequestValidationItem }) {
  if (!item.candidate_count || !item.candidate_results?.length) return null

  return (
    <div className="mt-3 rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-3 py-2">
      <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="text-[#A1A1AA]">후보 {item.tested_count}/{item.candidate_count} 검사</span>
        <span className="rounded border border-emerald-500/20 px-1.5 py-0.5 text-emerald-300">
          정상 {item.matched_count}
        </span>
        {item.missing_candidate_count > 0 && (
          <span className="rounded border border-red-500/20 px-1.5 py-0.5 text-red-300">
            누락 {item.missing_candidate_count}
          </span>
        )}
        {item.review_candidate_count > 0 && (
          <span className="rounded border border-amber-500/20 px-1.5 py-0.5 text-amber-300">
            확인 {item.review_candidate_count}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {item.candidate_results.map((candidate, index) => (
          <div key={candidate.candidate_key} className="rounded border border-[#242424] bg-[#121212] px-2.5 py-2">
            <div className="mb-1.5 flex items-center gap-2">
              <span className={`rounded border px-1.5 py-0.5 text-[10px] ${candidateStatusClasses(candidate.status)}`}>
                {candidate.status === 'normal' ? '정상' : candidate.status === 'review' ? '확인 필요' : '누락'}
              </span>
              <span className="truncate text-[11px] text-[#A1A1AA]" title={candidate.element_text}>
                {candidate.element_text || `후보 ${index + 1}`}
              </span>
            </div>
            {candidate.matched_tag ? (
              <dl className="space-y-1 text-[11px]">
                {[
                  ['area', candidate.matched_tag.ep_button_area],
                  ['area2', candidate.matched_tag.ep_button_area2],
                  ['name', candidate.matched_tag.ep_button_name],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[36px_1fr] gap-2">
                    <dt className="text-[#52525B]">{label}</dt>
                    <dd className="break-all text-[#D4D4D8]">{value || '-'}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-[11px] leading-4 text-[#71717A]">{candidate.reason}</p>
            )}
            {candidate.missing_fields.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {candidate.missing_fields.map(field => (
                  <span key={field} className="text-[10px] text-red-300">
                    {PARAM_LABELS[field] ?? field}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

interface ItemOverlay {
  key: string
  box: BoundingBox
  status: TagRequestCandidateResult['status']
  label: string
}

function itemOverlays(item: TagRequestValidationItem): ItemOverlay[] {
  const candidateOverlays = (item.candidate_results ?? [])
    .flatMap((candidate, index) => (
      hasVisibleBox(candidate.bounding_box)
        ? [{
            key: `${keyOf(item)}-candidate-${index}`,
            box: candidate.bounding_box,
            status: candidate.status,
            label: candidate.element_text || itemTitle(item),
          }]
        : []
    ))

  if (candidateOverlays.length) return candidateOverlays
  if (!hasVisibleBox(item.bounding_box)) return []
  return [{
    key: `${keyOf(item)}-request`,
    box: item.bounding_box,
    status: item.status,
    label: itemTitle(item),
  }]
}

export default function TagRequestResultPage({ result, onBack }: Props) {
  const [sheetIdx, setSheetIdx] = useState(0)
  const [panelTab, setPanelTab] = useState<PanelTab>(() => defaultPanelTab(result.sheets[0]))
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null)
  const [expandedItemKeys, setExpandedItemKeys] = useState<Set<string>>(() => new Set())
  const captureScrollRef = useRef<HTMLDivElement>(null)
  const overlayRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const current = result.sheets[sheetIdx] ?? null
  const visibleItems = current ? filteredItems(current, panelTab) : []
  const visibleOverlays = visibleItems.flatMap(item => (
    itemOverlays(item).map(overlay => ({ item, ...overlay }))
  ))
  const captureSegments = current ? screenshotSegments(current) : []

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
    setPanelTab(defaultPanelTab(result.sheets[idx]))
    setSelectedItemKey(null)
    setExpandedItemKeys(new Set())
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

  const handleToggleItem = (item: TagRequestValidationItem) => {
    const key = keyOf(item)
    const willExpand = !expandedItemKeys.has(key)

    setExpandedItemKeys(previous => {
      const next = new Set(previous)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })

    if (willExpand) {
      setSelectedItemKey(key)
      window.requestAnimationFrame(() => {
        scrollElementIntoContainerAfterLayout(overlayRefs.current[key] ?? null, captureScrollRef.current)
      })
    } else {
      setSelectedItemKey(previous => previous === key ? null : previous)
    }
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
          <span className="text-amber-400 font-medium">확인 {result.review_count ?? 0}건</span>
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
              {(sheet.review_count ?? 0) > 0 && <span className="ml-1 text-amber-400">({sheet.review_count})</span>}
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
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded border border-amber-500/60 bg-amber-500/15" />
                  확인 필요 {current.review_count ?? 0}
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
              ) : captureSegments.length > 0 ? (
                <div
                  className={`relative w-full ${isMobileScreenshot ? 'mx-auto' : ''}`}
                  style={maxDisplayWidth ? { maxWidth: maxDisplayWidth } : undefined}
                >
                  <div className="overflow-hidden rounded-lg ring-1 ring-white/5">
                    {captureSegments.map((segment, index) => (
                      <img
                        key={segment.screenshot_id}
                        src={`/api/screenshots/${segment.screenshot_id}`}
                        alt={captureSegments.length > 1 ? `Page screenshot ${index + 1}` : 'Page screenshot'}
                        width={segment.width}
                        height={segment.height}
                        className="block h-auto w-full"
                        draggable={false}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 pointer-events-none">
                    {visibleOverlays.map(overlay => {
                      const itemKey = keyOf(overlay.item)
                      const isSelected = selectedItemKey === itemKey
                      const isNormal = overlay.status === 'normal'
                      const isReview = overlay.status === 'review'
                      return (
                        <div
                          key={overlay.key}
                          ref={node => {
                            if (node) {
                              overlayRefs.current[itemKey] = node
                            }
                          }}
                          onClick={event => {
                            event.stopPropagation()
                            handleSelectItem(overlay.item)
                          }}
                          title={overlay.label}
                          style={{
                            position: 'absolute',
                            pointerEvents: 'auto',
                            ...boxToStyle(overlay.box, current.screenshot_width, current.screenshot_height),
                          }}
                          className={`cursor-pointer rounded transition-all ${
                            isNormal
                              ? isSelected
                                ? 'bg-emerald-500/30 border-2 border-emerald-400 shadow-lg shadow-emerald-900/40 z-20'
                                : 'bg-emerald-500/15 border border-emerald-500/60 hover:bg-emerald-500/25 z-10'
                              : isReview
                                ? isSelected
                                  ? 'bg-amber-500/30 border-2 border-amber-400 shadow-lg shadow-amber-900/40 z-20'
                                  : 'bg-amber-500/15 border border-amber-500/60 hover:bg-amber-500/25 z-10'
                              : isSelected
                                ? 'bg-red-500/30 border-2 border-red-400 shadow-lg shadow-red-900/40 z-20'
                                : 'bg-red-500/15 border border-red-500/60 hover:bg-red-500/25 z-10'
                          }`}
                        >
                          <span className={`absolute -top-5 left-0 text-[10px] bg-[#1A1A1A]/90 px-1 rounded whitespace-nowrap max-w-[180px] truncate pointer-events-none ${
                            isNormal ? 'text-emerald-400' : isReview ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {overlay.item.request.request_no}. {overlay.label}
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
              ['review', `확인 (${current.review_count ?? 0})`, 'border-amber-400'],
              ['normal', `정상 (${current.normal_count})`, 'border-emerald-400'],
            ] as const).map(([tab, label, border]) => (
              <button
                key={tab}
                onClick={() => {
                  setPanelTab(tab)
                  setSelectedItemKey(null)
                  setExpandedItemKeys(new Set())
                }}
                className={`flex-1 px-1 py-2.5 text-[11px] font-medium transition-colors ${
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
                const isExpanded = expandedItemKeys.has(key)
                const detailId = `request-details-${sheetIdx}-${item.request.row_number}`
                return (
                  <article
                    key={key}
                    className={`w-full border-b border-[#2A2A2A] transition-colors ${
                      isSelected ? 'bg-white/[0.04]' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleItem(item)}
                      aria-expanded={isExpanded}
                      aria-controls={detailId}
                      className="w-full px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs ${statusClasses(item)}`}>
                          {item.status === 'normal'
                            ? <CheckCircle2 size={13} />
                            : item.status === 'review'
                              ? <AlertCircle size={13} />
                              : <XCircle size={13} />
                          }
                          {statusLabel(item)}
                        </span>
                        <span className="text-xs text-[#71717A]">요청 {item.request.request_no}</span>
                        {item.match_source === 'ai' && (
                          <span className="rounded border border-purple-500/30 bg-purple-950/30 px-1.5 py-0.5 text-[10px] text-purple-200">
                            AI 위치
                          </span>
                        )}
                        {item.judgment_source === 'rag' && (
                          <span className="rounded border border-amber-500/30 bg-amber-950/20 px-1.5 py-0.5 text-[10px] text-amber-200">
                            RAG{typeof item.rag_score === 'number' ? ` ${item.rag_score.toFixed(2)}` : ''}
                          </span>
                        )}
                        <span className="ml-auto flex shrink-0 items-center gap-2">
                          {!item.bounding_box && <span className="text-[10px] text-[#52525B]">화면 위치 없음</span>}
                          <ChevronDown
                            size={16}
                            aria-hidden="true"
                            className={`text-[#71717A] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </span>
                      </div>
                      <p className={`${isExpanded ? 'break-words' : 'truncate'} text-sm font-medium text-white`}>
                        {itemTitle(item)}
                      </p>
                      <p className={`mt-1 font-mono text-xs text-[#71717A] ${isExpanded ? 'break-all' : 'truncate'}`}>
                        {item.request.event_name}
                      </p>
                    </button>

                    {isExpanded && (
                      <div id={detailId} className="px-4 pb-4">
                        {item.judgment_reason && (
                          <p className="text-xs leading-5 text-[#71717A]">{item.judgment_reason}</p>
                        )}
                        <ParamComparison item={item} />
                        <RequestExamples item={item} />
                        <CandidateCoverage item={item} />
                        <Substitutions item={item} />
                        <MissingFields fields={item.missing_fields} />
                      </div>
                    )}
                  </article>
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
