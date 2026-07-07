import type { GeneratedCodeSnapshot, ScanHistoryRecord, ScanHistorySummary } from '../types'

export async function fetchScanHistoryList(): Promise<ScanHistorySummary[]> {
  const res = await fetch('/api/scan-history')
  if (!res.ok) {
    throw new Error('실행 리포트를 불러오지 못했습니다.')
  }
  return res.json()
}

export async function fetchScanHistoryDetail(id: string): Promise<ScanHistoryRecord> {
  const res = await fetch(`/api/scan-history/${id}`)
  if (!res.ok) {
    throw new Error('실행 리포트를 찾을 수 없습니다.')
  }
  return res.json()
}

export async function deleteScanHistory(id: string): Promise<void> {
  const res = await fetch(`/api/scan-history/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    throw new Error('실행 리포트를 삭제하지 못했습니다.')
  }
}

export async function saveGeneratedCode(
  historyId: string,
  pageUrl: string,
  code: string,
  issueCount: number,
): Promise<GeneratedCodeSnapshot[]> {
  const res = await fetch(`/api/scan-history/${historyId}/generated-code`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      page_url: pageUrl,
      code,
      issue_count: issueCount,
    }),
  })
  if (!res.ok) {
    throw new Error('생성 코드 저장에 실패했습니다.')
  }
  const record: ScanHistoryRecord = await res.json()
  return record.generated_codes
}

export function formatHistoryDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getSavedCodeForPage(
  codes: GeneratedCodeSnapshot[] | undefined,
  pageUrl: string,
): string | null {
  if (!codes?.length) return null
  const match = codes.find(item => item.page_url === pageUrl)
  return match?.code ?? null
}
