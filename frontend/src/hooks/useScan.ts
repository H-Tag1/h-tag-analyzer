import { useState, useRef, useCallback } from 'react'
import type { PageScanData, ScanEventType } from '../types'

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
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null)
  const esRef = useRef<EventSource | null>(null)

  const start = useCallback((url: string, fullScan: boolean) => {
    esRef.current?.close()
    setStep('loading')
    setError(null)
    setPages([])
    setBatchProgress(null)

    const qs = new URLSearchParams({ url, fullScan: String(fullScan) })
    const es = new EventSource(`/api/scan?${qs}`)
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
          setStep('done')
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
          setStep('done')
          es.close()
          break
        case 'error':
          setError(event.message)
          setStep('error')
          es.close()
          break
      }
    }

    es.onerror = () => {
      if (step !== 'done') {
        setError('서버 연결이 끊어졌습니다.')
        setStep('error')
      }
      es.close()
    }
  }, [step])

  const reset = useCallback(() => {
    esRef.current?.close()
    setStep('idle')
    setError(null)
    setPages([])
    setBatchProgress(null)
  }, [])

  return { step, error, pages, batchProgress, start, reset }
}
