import { useState, useRef, useCallback } from 'react'
import type { PageScanData, ScanEventType, ScanStartOptions } from '../types'

export type ScanStep =
  | 'idle'
  | 'loading'
  | 'screenshot'
  | 'collecting'
  | 'ai_analyzing'
  | 'done'
  | 'error'

export interface BatchProgress {
  current: number
  total: number
  currentUrl: string
}

export function useScan() {
  const [step, setStep] = useState<ScanStep>('idle')
  const [error, setError] = useState<string | null>(null)
  const [pages, setPages] = useState<PageScanData[]>([])
  const [historyId, setHistoryId] = useState<string | null>(null)
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null)
  const esRef = useRef<EventSource | null>(null)

  const start = useCallback((options: ScanStartOptions) => {
    esRef.current?.close()
    setStep('loading')
    setError(null)
    setPages([])
    setHistoryId(null)
    setBatchProgress(null)

    const openStream = (streamUrl: string) => {
      const es = new EventSource(streamUrl)
      let streamFinished = false
      esRef.current = es

      es.onmessage = (e) => {
        const event: ScanEventType = JSON.parse(e.data)

        switch (event.type) {
          case 'scan_start':
            setStep('loading')
            break
          case 'screenshot_done':
            setStep('screenshot')
            break
          case 'elements_collected':
            setStep('collecting')
            break
          case 'ai_analyzing':
            setStep('ai_analyzing')
            break
          case 'scan_complete':
            setPages([event.data])
            setHistoryId(event.history_id ?? null)
            setStep('done')
            streamFinished = true
            es.close()
            break
          case 'pages_discovered':
            setBatchProgress({ current: 0, total: event.total, currentUrl: '' })
            break
          case 'page_start':
            setBatchProgress({ current: event.index, total: event.total, currentUrl: event.url })
            setStep('ai_analyzing')
            break
          case 'page_complete':
            setPages(prev => [...prev, event.data])
            break
          case 'batch_complete':
            setPages(event.pages)
            setHistoryId(event.history_id ?? null)
            setStep('done')
            streamFinished = true
            es.close()
            break
          case 'error':
            setError(event.message)
            setStep('error')
            streamFinished = true
            es.close()
            break
        }
      }

      es.onerror = () => {
        if (streamFinished) return
        setError('서버 연결이 끊어졌습니다.')
        setStep('error')
        es.close()
      }
    }

    void (async () => {
      try {
        if (options.login?.enabled) {
          const response = await fetch('/api/scan-sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(options),
          })

          if (!response.ok) {
            const data = await response.json().catch(() => null)
            throw new Error(data?.detail ?? '검사 세션을 생성하지 못했습니다.')
          }

          const data: { scanId: string } = await response.json()
          openStream(`/api/scan-sessions/${data.scanId}/events`)
          return
        }

        const qs = new URLSearchParams({
          url: options.url,
          fullScan: String(options.fullScan),
          trackingId: options.trackingId,
        })
        if (options.scanRange) {
          qs.set('rangePreset', options.scanRange.preset)
          if (options.scanRange.startY !== undefined) {
            qs.set('rangeStartY', String(options.scanRange.startY))
          }
          if (options.scanRange.endY !== undefined) {
            qs.set('rangeEndY', String(options.scanRange.endY))
          }
        }
        openStream(`/api/scan?${qs}`)
      } catch (e) {
        setError(e instanceof Error ? e.message : '검사를 시작하지 못했습니다.')
        setStep('error')
      }
    })()
  }, [])

  const reset = useCallback(() => {
    esRef.current?.close()
    setStep('idle')
    setError(null)
    setPages([])
    setHistoryId(null)
    setBatchProgress(null)
  }, [])

  return { step, error, pages, historyId, batchProgress, start, reset }
}
