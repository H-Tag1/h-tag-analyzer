import { useEffect, useState } from 'react'
import { ExternalLink, Loader, Trash2 } from 'lucide-react'
import type { ScanHistorySummary } from '../types'
import { deleteScanHistory, fetchScanHistoryList, formatHistoryDate } from '../utils/scanHistory'

interface Props {
  onOpenDetail: (id: string) => void
}

export default function ReportTable({ onOpenDetail }: Props) {
  const [records, setRecords] = useState<ScanHistorySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadRecords = async () => {
    setLoading(true)
    setError(null)
    try {
      setRecords(await fetchScanHistoryList())
    } catch (e) {
      setError(e instanceof Error ? e.message : '리포트를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    void fetchScanHistoryList()
      .then(data => {
        if (!cancelled) setRecords(data)
      })
      .catch(caughtError => {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : '리포트를 불러오지 못했습니다.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleDelete = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (!window.confirm('이 실행 리포트를 삭제할까요?')) return

    setDeletingId(id)
    try {
      await deleteScanHistory(id)
      setRecords(prev => prev.filter(item => item.id !== id))
    } catch (e) {
      window.alert(e instanceof Error ? e.message : '삭제에 실패했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="w-full animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">실행 리포트</h2>
        <p className="mt-1 text-sm text-[#71717A]">최근 트래킹 검사 결과를 확인할 수 있습니다.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#151515]/90 py-12 text-[#52525B]">
          <Loader size={18} className="animate-spin" />
          <span className="text-sm">리포트를 불러오는 중...</span>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/10 px-5 py-8 text-center">
          <p className="text-sm text-red-300 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => void loadRecords()}
            className="text-sm text-white border border-[#2A2A2A] rounded-lg px-4 py-2 hover:bg-white/[0.04]"
          >
            다시 시도
          </button>
        </div>
      )}

      {!loading && !error && records.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-[#151515]/90 px-6 py-12 text-center">
          <p className="text-sm text-[#71717A]">저장된 실행 리포트가 없습니다. 검사를 실행하면 자동으로 저장됩니다.</p>
        </div>
      )}

      {!loading && !error && records.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#151515]/90">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#111] text-left text-xs text-[#71717A]">
                  <th className="px-4 py-3 font-medium whitespace-nowrap">실행일시</th>
                  <th className="px-4 py-3 font-medium">대상 URL</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">결과</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap w-24 text-center">액션</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => {
                  const isDeleting = deletingId === record.id

                  return (
                    <tr
                      key={record.id}
                      onClick={() => onOpenDetail(record.id)}
                      className="border-b border-white/[0.06] last:border-0 cursor-pointer transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3 text-[#A1A1AA] whitespace-nowrap align-middle">
                        {formatHistoryDate(record.created_at)}
                      </td>
                      <td className="px-4 py-3 align-middle min-w-0">
                        <p className="truncate text-white max-w-[360px] lg:max-w-[480px]" title={record.url}>
                          {record.url}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#52525B]">
                          {record.mode === 'batch' ? '전체 검사' : '단일 검사'}
                          {record.page_count > 1 && ` · ${record.page_count}페이지`}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-middle whitespace-nowrap">
                        <span className="text-emerald-400">검증 {record.tracked_count}</span>
                        <span className="mx-1.5 text-[#52525B]">/</span>
                        <span className="text-red-400">누락 {record.issue_count}</span>
                        {(record.review_count ?? 0) > 0 && (
                          <>
                            <span className="mx-1.5 text-[#52525B]">/</span>
                            <span className="text-amber-400">확인 {record.review_count}</span>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation()
                              onOpenDetail(record.id)
                            }}
                            title="리포트 보기"
                            className="rounded-lg p-2 text-[#71717A] transition-colors hover:bg-purple-500/10 hover:text-purple-300"
                          >
                            <ExternalLink size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={e => void handleDelete(record.id, e)}
                            disabled={isDeleting}
                            title="삭제"
                            className="rounded-lg p-2 text-[#71717A] transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                          >
                            {isDeleting ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
