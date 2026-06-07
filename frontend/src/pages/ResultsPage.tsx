import { useState } from 'react'
import { ArrowLeft, Download, ExternalLink } from 'lucide-react'
import type { AnalyzeResult, SelectorResult, StatusFilter } from '../types'
import StatCard from '../components/StatCard'
import SelectorTable from '../components/SelectorTable'
import AiPanel from '../components/AiPanel'

interface Props {
  result: AnalyzeResult
  onBack: () => void
}

const TABS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL',     label: '전체' },
  { key: 'OK',      label: '정상' },
  { key: 'MISSING', label: '누락' },
  { key: 'ERROR',   label: '오류' },
]

export default function ResultsPage({ result, onBack }: Props) {
  const [filter, setFilter] = useState<StatusFilter>('ALL')
  const [aiTarget, setAiTarget] = useState<SelectorResult | null>(null)

  const exportJson = () => {
    const missing = result.results.filter(r => r.status === 'MISSING')
    const blob = new Blob([JSON.stringify(missing, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'missing-tags.json'
    a.click()
  }

  const exportCsv = () => {
    const header = 'selector,eventName,area,area2,status,matchCount'
    const rows = result.results.map(r =>
      `"${r.selector}","${r.eventName}","${r.area}","${r.area2}",${r.status},${r.matchCount}`
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'ga-tag-report.csv'
    a.click()
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] p-6">
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 text-[#52525B] hover:text-white border border-[#2A2A2A] rounded-lg transition-all">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-white font-semibold text-lg">분석 결과</h2>
              <a href={result.url} target="_blank" rel="noreferrer" className="text-[#52525B] text-sm hover:text-purple-400 flex items-center gap-1 transition-colors">
                {result.url}
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={exportJson} className="flex items-center gap-1.5 px-3 py-2 border border-[#2A2A2A] rounded-lg text-[#A1A1AA] hover:text-white hover:border-[#3A3A3A] text-sm transition-all">
              <Download size={14} />
              JSON
            </button>
            <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-2 border border-[#2A2A2A] rounded-lg text-[#A1A1AA] hover:text-white hover:border-[#3A3A3A] text-sm transition-all">
              <Download size={14} />
              CSV
            </button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="전체 셀렉터" value={result.totalCount}   color="white" active={filter === 'ALL'}     onClick={() => setFilter('ALL')} />
          <StatCard label="정상 (DOM 매칭)" value={result.okCount}  color="green" active={filter === 'OK'}      onClick={() => setFilter('OK')} />
          <StatCard label="누락 (이벤트 미발화)" value={result.missingCount} color="red" active={filter === 'MISSING'} onClick={() => setFilter('MISSING')} />
          <StatCard label="오류 (잘못된 셀렉터)" value={result.errorCount}   color="amber" active={filter === 'ERROR'}   onClick={() => setFilter('ERROR')} />
        </div>

        {/* 필터 탭 */}
        <div className="flex items-center gap-1 mb-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === tab.key
                  ? 'bg-[#2A2A2A] text-white'
                  : 'text-[#52525B] hover:text-[#A1A1AA]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 테이블 */}
        <SelectorTable
          results={result.results}
          filter={filter}
          onAiClick={setAiTarget}
        />
      </div>

      {/* AI 패널 */}
      {aiTarget && <AiPanel item={aiTarget} onClose={() => setAiTarget(null)} />}
    </div>
  )
}
