import { useState } from 'react'
import { X, Sparkles, Copy, Check, Loader } from 'lucide-react'
import type { SelectorResult, RecommendResponse } from '../types'

interface Props {
  item: SelectorResult
  onClose: () => void
}

export default function AiPanel({ item, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [rec, setRec] = useState<RecommendResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchRecommend = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          selector: item.selector,
          eventName: item.eventName,
          area: item.area,
          area2: item.area2,
          domClasses: [],
        }),
      })
      setRec(await res.json())
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    if (!rec) return
    navigator.clipboard.writeText(rec.recommended)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* panel */}
      <div className="relative w-full max-w-md bg-[#1A1A1A] border-l border-[#2A2A2A] h-full overflow-y-auto animate-slide-in">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-purple-400">
              <Sparkles size={18} />
              <span className="font-semibold">AI 셀렉터 추천</span>
            </div>
            <button onClick={onClose} className="text-[#52525B] hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* 원래 정보 */}
          <div className="mb-6 space-y-3">
            <div>
              <p className="text-xs text-[#52525B] mb-1">원래 셀렉터</p>
              <p className="font-mono-selector text-white bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-3 break-all">
                {item.selector}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[#52525B] mb-1">이벤트명</p>
                <p className="text-sm text-white truncate">{item.eventName}</p>
              </div>
              <div>
                <p className="text-xs text-[#52525B] mb-1">영역</p>
                <p className="text-sm text-white truncate">{item.area} &gt; {item.area2}</p>
              </div>
            </div>
          </div>

          {/* 추천 요청 버튼 */}
          {!rec && (
            <button
              onClick={fetchRecommend}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {loading ? <><Loader size={16} className="animate-spin" /> 분석 중...</> : <><Sparkles size={16} /> AI 추천 받기</>}
            </button>
          )}

          {/* 추천 결과 */}
          {rec && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <p className="text-xs text-[#52525B] mb-1">추천 셀렉터</p>
                <div className="flex items-start gap-2">
                  <p className="flex-1 font-mono-selector text-emerald-400 bg-[#0F0F0F] border border-emerald-900/50 rounded-lg p-3 break-all">
                    {rec.recommended}
                  </p>
                  <button
                    onClick={copy}
                    className="mt-1 p-2 text-[#52525B] hover:text-white transition-colors"
                  >
                    {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#52525B] mb-1">설명</p>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">{rec.explanation}</p>
              </div>
              <button
                onClick={() => setRec(null)}
                className="text-xs text-[#52525B] hover:text-white transition-colors"
              >
                다시 추천 받기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
