import { useState } from 'react'
import { Search, Clock, ArrowRight, ArrowLeft, LayoutGrid } from 'lucide-react'

interface Props {
  onStart: (url: string, fullScan: boolean) => void
  onBack?: () => void
  layout?: 'page' | 'embedded'
}

const HISTORY_KEY = 'htag_url_history'

export default function InputPage({ onStart, onBack, layout = 'page' }: Props) {
  const [url, setUrl] = useState('')
  const [fullScan, setFullScan] = useState(false)
  const [history] = useState<string[]>(() => {
    const saved = localStorage.getItem(HISTORY_KEY)
    return saved ? JSON.parse(saved).slice(0, 5) : []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    const normalized = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`
    const newHistory = [normalized, ...history.filter(h => h !== normalized)].slice(0, 5)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
    onStart(normalized, fullScan)
  }

  const content = (
    <div className="relative z-10 mx-auto w-full max-w-2xl animate-fade-in">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#52525B] hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          메인으로
        </button>
      )}

      {layout === 'page' && (
        <div className="text-center mb-10">
          <p className="text-sm text-purple-400 mb-3">검사하기</p>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">검사 URL 입력</h1>
          <p className="text-[#A1A1AA] text-lg leading-relaxed">
            URL을 입력하면 AI가 스크린샷을 분석해<br />
            <span className="text-purple-400">누락된 GA4 태그</span>를 시각적으로 찾아드립니다.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525B]" />
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://www.hddfs.com"
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-4 pl-11 text-white placeholder-[#52525B] focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all text-base"
            />
          </div>
          <button
            type="submit"
            disabled={!url.trim()}
            className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            검사 시작
            <ArrowRight size={18} />
          </button>
        </div>

        <div
          onClick={() => setFullScan(v => !v)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all select-none ${
            fullScan
              ? 'border-purple-700 bg-purple-900/20 text-white'
              : 'border-[#2A2A2A] bg-[#1A1A1A] text-[#A1A1AA] hover:border-[#3A3A3A]'
          }`}
        >
          <div className={`w-9 h-5 rounded-full relative transition-colors ${fullScan ? 'bg-purple-600' : 'bg-[#3A3A3A]'}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${fullScan ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
          <LayoutGrid size={16} className={fullScan ? 'text-purple-400' : 'text-[#52525B]'} />
          <div>
            <p className="text-sm font-medium">전체 온라인몰 체크</p>
            <p className="text-xs text-[#52525B]">동일 도메인 내부 페이지를 depth 2까지 자동 스캔합니다</p>
          </div>
        </div>
      </form>

      {history.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[#52525B] text-sm mb-3">
            <Clock size={14} />
            <span>최근 분석</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map(h => (
              <button
                key={h}
                onClick={() => { setUrl(h) }}
                className="px-3 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[#A1A1AA] text-sm hover:border-purple-700 hover:text-white transition-all truncate max-w-[280px]"
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  )

  if (layout === 'embedded') return content

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-900/10 blur-3xl" />
      </div>

      {content}
    </div>
  )
}
