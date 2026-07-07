import { useEffect, useState } from 'react'
import { ChevronRight, Check, Loader, Trash2 } from 'lucide-react'
import type { AiAnalysisItem, GeneratedCodeSnapshot } from '../types'
import TagSpecEditor from './TagSpecEditor'
import CodeViewer from './CodeViewer'
import { issueIdentityKey } from '../utils/dismissedIssues'
import { saveGeneratedCode } from '../utils/scanHistory'
import { normalizeTagSpec, toGaSpec, type TagSpec } from '../utils/tagSpec'

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

function getTagSpec(issue: AiAnalysisItem, edited: Record<string, TagSpec>): TagSpec {
  return edited[issueIdentityKey(issue)] ?? normalizeTagSpec(issue.recommended_ga_spec)
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
  const [generatedCode, setGeneratedCode] = useState<string | null>(initialGeneratedCode)
  const [isGenerating, setIsGenerating] = useState(false)
  const [dismissingKey, setDismissingKey] = useState<string | null>(null)

  useEffect(() => {
    setGeneratedCode(initialGeneratedCode)
  }, [initialGeneratedCode, pageUrl])

  const handleDismiss = async (issue: AiAnalysisItem) => {
    const key = issueIdentityKey(issue)
    const tag = getTagSpec(issue, editedTags)
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
        issues.map(async (issue, idx) => {
          const tag = getTagSpec(issue, editedTags)
          const spec = toGaSpec(tag, issue.element_selector)
          const res = await fetch('/api/generate-code', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ ga_spec: spec }),
          })
          const data = await res.json()
          const label = issue.element_text || `누락 ${idx + 1}`
          return `// ${label}\n${data.code as string}`
        }),
      )
      const code = results.join('\n\n')
      setGeneratedCode(code)

      if (historyId && pageUrl) {
        const updatedCodes = await saveGeneratedCode(historyId, pageUrl, code, issues.length)
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
        <p className="text-sm">누락된 GA 태그가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 border-b border-[#2A2A2A] p-3 bg-[#111] z-10">
        <button
          onClick={handleGenerateAll}
          disabled={isGenerating}
          className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-purple-900/20"
        >
          {isGenerating
            ? <><Loader size={14} className="animate-spin" /> 생성 중...</>
            : <><Check size={14} /> 확정 및 코드 생성 ({issues.length}건)</>
          }
        </button>

        {generatedCode && (
          <div className="mt-3 max-h-52 overflow-y-auto">
            <p className="text-xs text-[#52525B] mb-1">ga4common.js 코드</p>
            <CodeViewer code={generatedCode} />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {issues.map((item, idx) => {
          const isSelected = selectedIndex === idx
          const tag = getTagSpec(item, editedTags)
          const key = issueIdentityKey(item)
          const isDismissing = dismissingKey === key

          return (
            <div
              key={key}
              className={`border-b border-[#2A2A2A] transition-colors ${isSelected ? 'bg-white/[0.03]' : ''}`}
            >
              <div className="flex items-start gap-1 px-2 py-3">
                <button
                  onClick={() => onSelect(isSelected ? -1 : idx)}
                  className="flex-1 flex items-start gap-3 text-left hover:bg-white/[0.02] rounded-lg px-2 py-0.5 min-w-0"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.element_text || item.element_selector}</p>
                    <p className="text-xs text-[#52525B] truncate">{item.issue}</p>
                    {!isSelected && tag.event_name && (
                      <p className="text-[11px] text-purple-400/80 truncate mt-0.5">{tag.event_name}</p>
                    )}
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
                  <TagSpecEditor
                    value={tag}
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
