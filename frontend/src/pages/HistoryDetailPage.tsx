import { useEffect, useState } from 'react'
import { Loader } from 'lucide-react'
import AnalysisPage from './AnalysisPage'
import type { GeneratedCodeSnapshot, ScanHistoryRecord } from '../types'
import { fetchScanHistoryDetail, formatHistoryDate } from '../utils/scanHistory'

interface Props {
  historyId: string
  onBack: () => void
}

export default function HistoryDetailPage({ historyId, onBack }: Props) {
  const [record, setRecord] = useState<ScanHistoryRecord | null>(null)
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCodeSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchScanHistoryDetail(historyId)
        if (!cancelled) {
          setRecord(data)
          setGeneratedCodes(data.generated_codes)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '리포트를 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [historyId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center text-[#52525B]">
        <div className="text-center">
          <Loader size={24} className="animate-spin mx-auto mb-3" />
          <p className="text-sm">실행 리포트를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error ?? '리포트를 찾을 수 없습니다.'}</p>
          <button onClick={onBack} className="text-sm text-[#52525B] hover:text-white transition-colors">
            목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <AnalysisPage
      pages={record.pages}
      onBack={onBack}
      historyId={record.id}
      savedGeneratedCodes={generatedCodes}
      title="결과 레포트"
      subtitle={`${formatHistoryDate(record.created_at)} · ${record.mode === 'batch' ? '전체 검사' : '단일 검사'}`}
      onGeneratedCodesChange={setGeneratedCodes}
    />
  )
}
