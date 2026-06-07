import { useState } from 'react'
import { AlertTriangle, ChevronRight, Check, Loader } from 'lucide-react'
import type { AiAnalysisItem } from '../types'
import GaSpecEditor from './GaSpecEditor'
import CodeViewer from './CodeViewer'

interface Props {
  issues: AiAnalysisItem[]
  selectedIndex: number | null
  onSelect: (index: number) => void
}

export default function IssuePanel({ issues, selectedIndex, onSelect }: Props) {
  const [editedSpecs, setEditedSpecs] = useState<Record<number, Record<string, unknown>>>({})
  const [generatedCodes, setGeneratedCodes] = useState<Record<number, string>>({})
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null)

  const handleAccept = async (idx: number) => {
    const spec = editedSpecs[idx] ?? issues[idx].recommended_ga_spec
    setLoadingIdx(idx)
    try {
      const res = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ga_spec: spec }),
      })
      const data = await res.json()
      setGeneratedCodes(prev => ({ ...prev, [idx]: data.code }))
    } finally {
      setLoadingIdx(null)
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
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2A2A2A]">
        <AlertTriangle size={15} className="text-amber-400" />
        <span className="text-sm font-medium text-white">누락 태그</span>
        <span className="ml-auto text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full">{issues.length}건</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {issues.map((item, idx) => {
          const isSelected = selectedIndex === idx
          const spec = editedSpecs[idx] ?? item.recommended_ga_spec
          const code = generatedCodes[idx]

          return (
            <div
              key={idx}
              className={`border-b border-[#2A2A2A] transition-colors ${isSelected ? 'bg-white/[0.03]' : ''}`}
            >
              {/* 이슈 헤더 (클릭으로 선택) */}
              <button
                onClick={() => onSelect(isSelected ? -1 : idx)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/[0.02]"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.element_text || item.element_selector}</p>
                  <p className="text-xs text-[#52525B] truncate">{item.issue}</p>
                </div>
                <ChevronRight
                  size={14}
                  className={`text-[#52525B] flex-shrink-0 transition-transform ${isSelected ? 'rotate-90' : ''}`}
                />
              </button>

              {/* 펼쳐진 상세 편집 폼 */}
              {isSelected && (
                <div className="px-4 pb-4 space-y-3 animate-fade-in">
                  <div>
                    <p className="text-xs text-[#52525B] mb-1">셀렉터</p>
                    <p className="text-xs font-mono text-[#A1A1AA] bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-2 py-1.5 break-all">
                      {item.element_selector}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#52525B] mb-1">추천 GA 스펙 (수정 가능)</p>
                    <GaSpecEditor
                      spec={spec}
                      onChange={val => setEditedSpecs(prev => ({ ...prev, [idx]: val }))}
                    />
                  </div>

                  <button
                    onClick={() => handleAccept(idx)}
                    disabled={loadingIdx === idx}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  >
                    {loadingIdx === idx
                      ? <><Loader size={14} className="animate-spin" /> 생성 중...</>
                      : <><Check size={14} /> 확정 및 코드 생성</>
                    }
                  </button>

                  {code && (
                    <div>
                      <p className="text-xs text-[#52525B] mb-1">생성된 코드</p>
                      <CodeViewer code={code} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
