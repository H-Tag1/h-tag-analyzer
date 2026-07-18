import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight, Check, Loader, Trash2 } from 'lucide-react'
import type { AiAnalysisItem, GeneratedCodeSnapshot } from '../types'
import TagSpecEditor from './TagSpecEditor'
import CodeViewer from './CodeViewer'
import { issueIdentityKey } from '../utils/dismissedIssues'
import { saveGeneratedCode } from '../utils/scanHistory'
import { mergeTagSpec, normalizeTagSpec, type TagSpec } from '../utils/tagSpec'
import { scrollElementIntoContainerAfterLayout } from '../utils/scrollIntoContainer'

interface Props {
  issues: AiAnalysisItem[]
  selectedIndex: number | null
  onSelect: (index: number) => void
  onDismiss: (issue: AiAnalysisItem, tag: TagSpec) => Promise<void>
  historyId?: string | null
  pageUrl?: string
  initialGeneratedCode?: string | null
  onGeneratedCodesChange?: (codes: GeneratedCodeSnapshot[]) => void
}

function getTagSpec(
  issue: AiAnalysisItem,
  edited: Record<string, TagSpec>,
  suggested: Record<string, TagSpec>,
): TagSpec {
  const key = issueIdentityKey(issue)
  if (edited[key]) return edited[key]

  const base = normalizeTagSpec(issue.recommended_ga_spec)
  const suggestion = suggested[key]
  return suggestion ? mergeTagSpec(base, suggestion) : base
}

function buildGenerateSpec(issue: AiAnalysisItem, tag: TagSpec): Record<string, unknown> {
  const base = issue.recommended_ga_spec ?? {}
  return {
    ...base,
    element_selector: issue.element_selector,
    event_name: tag.event_name.trim() || String(base.event_name ?? ''),
    ep_button_area: tag.ep_button_area.trim() || String(base.ep_button_area ?? ''),
    ep_button_area2: tag.ep_button_area2.trim() || String(base.ep_button_area2 ?? ''),
    ep_button_name: tag.ep_button_name.trim() || String(base.ep_button_name ?? ''),
    is_virtual: false,
  }
}

function issuesForCodeGeneration(issues: AiAnalysisItem[]): AiAnalysisItem[] {
  const seenGroups = new Set<string>()
  return issues.filter(issue => {
    if (issue.verification_source === 'group_inherited') {
      return false
    }
    const groupId = issue.click_group_id
    if (!groupId) {
      return true
    }
    if (seenGroups.has(groupId)) {
      return false
    }
    seenGroups.add(groupId)
    return true
  })
}

export default function IssuePanel({
  issues,
  selectedIndex,
  onSelect,
  onDismiss,
  historyId = null,
  pageUrl = '',
  initialGeneratedCode = null,
  onGeneratedCodesChange,
}: Props) {
  const [editedTags, setEditedTags] = useState<Record<string, TagSpec>>({})
  const [suggestedTags, setSuggestedTags] = useState<Record<string, TagSpec>>({})
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(initialGeneratedCode)
  const [isGenerating, setIsGenerating] = useState(false)
  const [dismissingKey, setDismissingKey] = useState<string | null>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedIndex === null || selectedIndex < 0) return

    scrollElementIntoContainerAfterLayout(
      itemRefs.current[selectedIndex] ?? null,
      listRef.current,
    )
  }, [selectedIndex])

  const codeGenerationIssues = useMemo(() => issuesForCodeGeneration(issues), [issues])

  useEffect(() => {
    if (!pageUrl || issues.length === 0) {
      return
    }

    let cancelled = false

    void (async () => {
      setIsSuggesting(true)
      try {
        const res = await fetch('/api/suggest-tag-specs', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            page_url: pageUrl,
            issues: issues.map(issue => ({
              element_selector: issue.element_selector,
              element_text: issue.element_text,
              recommended_ga_spec: issue.recommended_ga_spec,
            })),
          }),
        })
        if (!res.ok || cancelled) return

        const data = await res.json() as { suggestions: TagSpec[] }
        const next: Record<string, TagSpec> = {}
        issues.forEach((issue, idx) => {
          const suggestion = data.suggestions[idx]
          if (suggestion) {
            next[issueIdentityKey(issue)] = suggestion
          }
        })
        if (!cancelled) {
          setSuggestedTags(next)
        }
      } finally {
        if (!cancelled) {
          setIsSuggesting(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [pageUrl, issues])

  const handleDismiss = async (issue: AiAnalysisItem) => {
    const key = issueIdentityKey(issue)
    const tag = getTagSpec(issue, editedTags, suggestedTags)
    setDismissingKey(key)
    try {
      await onDismiss(issue, tag)
      setGeneratedCode(null)
      if (selectedIndex !== null && issues[selectedIndex] && issueIdentityKey(issues[selectedIndex]) === key) {
        onSelect(-1)
      }
    } finally {
      setDismissingKey(null)
    }
  }

  const handleGenerateAll = async () => {
    setIsGenerating(true)
    setGeneratedCode(null)
    try {
      const results = await Promise.all(
        codeGenerationIssues.map(async (issue, idx) => {
          const tag = getTagSpec(issue, editedTags, suggestedTags)
          const spec = buildGenerateSpec(issue, tag)
          const res = await fetch('/api/generate-code', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ ga_spec: spec, page_url: pageUrl }),
          })
          if (!res.ok) {
            const errorData = await res.json().catch(() => null)
            throw new Error(errorData?.detail ?? '코드 생성에 실패했습니다.')
          }
          const data = await res.json()
          const label = issue.element_text || `누락 ${idx + 1}`
          return `// ${label}\n${data.code as string}`
        }),
      )
      const code = results.join('\n\n')
      setGeneratedCode(code)

      if (historyId && pageUrl) {
        const updatedCodes = await saveGeneratedCode(historyId, pageUrl, code, codeGenerationIssues.length)
        onGeneratedCodesChange?.(updatedCodes)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#52525B] py-16">
        <Check size={32} className="text-emerald-500 mb-3" />
        <p className="text-sm">수정이 필요한 누락 태그가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-shrink-0 border-b border-[#2A2A2A] p-3 bg-[#111] z-10">
        <button
          onClick={handleGenerateAll}
          disabled={isGenerating}
          className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-purple-900/20"
        >
          {isGenerating
            ? <><Loader size={14} className="animate-spin" /> 생성 중...</>
            : <><Check size={14} /> 확정 및 코드 생성 ({codeGenerationIssues.length}건)</>
          }
        </button>

        {generatedCode && (
          <div className="mt-3 max-h-52 overflow-y-auto">
            <p className="text-xs text-[#52525B] mb-1">ga4common.js 코드</p>
            <CodeViewer code={generatedCode} />
          </div>
        )}
      </div>

      <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto">
        {issues.map((item, idx) => {
          const isSelected = selectedIndex === idx
          const key = issueIdentityKey(item)
          const tag = getTagSpec(item, editedTags, suggestedTags)
          const suggestion = suggestedTags[key]
          const isDismissing = dismissingKey === key

          const isGroupInherited = item.verification_source === 'group_inherited'

          return (
            <div
              key={key}
              ref={node => {
                itemRefs.current[idx] = node
              }}
              className={`border-b border-[#2A2A2A] transition-colors ${
                isSelected
                  ? isGroupInherited
                    ? 'bg-yellow-400/10 border-l-2 border-l-yellow-300'
                    : 'bg-red-500/10 border-l-2 border-l-red-400'
                  : 'border-l-2 border-l-transparent'
              }`}
            >
              <div className="flex items-start gap-1 px-2 py-3">
                <button
                  onClick={() => onSelect(idx)}
                  className="flex-1 flex items-start gap-3 text-left hover:bg-white/[0.02] rounded-lg px-2 py-0.5 min-w-0"
                >
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    isGroupInherited ? 'bg-yellow-300' : 'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {tag.event_name || item.element_text || item.element_selector}
                    </p>
                    {isGroupInherited && (
                      <p className="text-[11px] text-yellow-300/90 truncate">
                        그룹 대표 누락 · 보완 코드는 대표 항목 기준
                      </p>
                    )}
                    <p className="text-xs text-[#52525B] truncate">{item.issue}</p>
                  </div>
                  <ChevronRight
                    size={14}
                    className={`text-[#52525B] flex-shrink-0 transition-transform mt-0.5 ${isSelected ? 'rotate-90' : ''}`}
                  />
                </button>
                <button
                  onClick={() => handleDismiss(item)}
                  disabled={isDismissing}
                  title="트래킹 불필요 — 제외"
                  className="p-2 text-[#52525B] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40 flex-shrink-0"
                >
                  {isDismissing
                    ? <Loader size={14} className="animate-spin" />
                    : <Trash2 size={14} />
                  }
                </button>
              </div>

              {isSelected && (
                <div className="px-4 pb-4 animate-fade-in">
                  {isGroupInherited && (
                    <p className="text-xs text-[#52525B] mb-2">
                      동일 그룹 요소입니다. 보완 코드는 대표 누락 항목에서 한 번만 생성됩니다.
                    </p>
                  )}
                  {!isGroupInherited && isSuggesting && !suggestion && (
                    <p className="text-xs text-[#52525B] mb-2 flex items-center gap-1.5">
                      <Loader size={12} className="animate-spin" />
                      LLM 명명 추천 불러오는 중...
                    </p>
                  )}
                  <TagSpecEditor
                    value={tag}
                    readOnly={isGroupInherited}
                    onChange={val => setEditedTags(prev => ({ ...prev, [key]: val }))}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
