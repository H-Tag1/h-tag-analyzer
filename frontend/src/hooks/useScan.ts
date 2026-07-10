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

const MAX_ESTIMATED_PROGRESS = 90

export function useScan() {
  const [step, setStep] = useState<ScanStep>('idle')
  const [error, setError] = useState<string | null>(null)
  const [pages, setPages] = useState<PageScanData[]>([])
  const [historyId, setHistoryId] = useState<string | null>(null)
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null)
  const [progressPercent, setProgressPercent] = useState(0)
  const esRef = useRef<EventSource | null>(null)
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopEstimatedProgress = useCallback(() => {
    if (!progressTimerRef.current) return
    clearInterval(progressTimerRef.current)
    progressTimerRef.current = null
  }, [])

  const startEstimatedProgress = useCallback(() => {
    stopEstimatedProgress()
    progressTimerRef.current = setInterval(() => {
      setProgressPercent(prev => {
        if (prev >= MAX_ESTIMATED_PROGRESS) return prev
        const increment = prev < 30 ? 3 : prev < 65 ? 2 : 1
        return Math.min(MAX_ESTIMATED_PROGRESS, prev + increment)
      })
    }, 900)
  }, [stopEstimatedProgress])

  const start = useCallback((options: ScanStartOptions) => {
    esRef.current?.close()
    stopEstimatedProgress()
    setStep('loading')
    setError(null)
    setPages([])
    setHistoryId(null)
    setBatchProgress(null)
    setProgressPercent(3)
    startEstimatedProgress()

    const openStream = (streamUrl: string) => {
      const es = new EventSource(streamUrl)
      let streamFinished = false
      esRef.current = es

      es.onmessage = (e) => {
        const event: ScanEventType = JSON.parse(e.data)

        switch (event.type) {
          case 'scan_start':
            setStep('loading')
            setProgressPercent(prev => Math.max(prev, 5))
            break
          case 'screenshot_done':
            setStep('screenshot')
            setProgressPercent(prev => Math.max(prev, 82))
            break
          case 'elements_collected':
            setStep('collecting')
            setProgressPercent(prev => Math.max(prev, 90))
            break
          case 'ai_analyzing':
            setStep('ai_analyzing')
            setProgressPercent(prev => Math.max(prev, 96))
            break
          case 'scan_complete':
            setPages([event.data])
            setHistoryId(event.history_id ?? null)
            setStep('done')
            setProgressPercent(100)
            stopEstimatedProgress()
            streamFinished = true
            es.close()
            break
          case 'pages_discovered':
            stopEstimatedProgress()
            setBatchProgress({ current: 0, total: event.total, currentUrl: '' })
            setProgressPercent(5)
            break
          case 'page_start':
            setBatchProgress({ current: event.index, total: event.total, currentUrl: event.url })
            setProgressPercent(Math.round(((event.index - 1) / event.total) * 100))
            setStep('ai_analyzing')
            break
          case 'page_complete':
            setPages(prev => [...prev, event.data])
            setBatchProgress(prev => {
              if (!prev) return prev
              setProgressPercent(Math.round((event.index / prev.total) * 100))
              return { ...prev, current: event.index }
            })
            break
          case 'batch_complete':
            setPages(event.pages)
            setHistoryId(event.history_id ?? null)
            setStep('done')
            setProgressPercent(100)
            stopEstimatedProgress()
            streamFinished = true
            es.close()
            break
          case 'error':
            setError(event.message)
            setStep('error')
            stopEstimatedProgress()
            streamFinished = true
            es.close()
            break
        }
      }

      es.onerror = () => {
        if (streamFinished) return
        setError('서버 연결이 끊어졌습니다.')
        setStep('error')
        stopEstimatedProgress()
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
        stopEstimatedProgress()
      }
    })()
  }, [startEstimatedProgress, stopEstimatedProgress])

  const reset = useCallback(() => {
    esRef.current?.close()
    stopEstimatedProgress()
    setStep('idle')
    setError(null)
    setPages([])
    setHistoryId(null)
    setBatchProgress(null)
    setProgressPercent(0)
  }, [stopEstimatedProgress])

  return { step, error, pages, historyId, batchProgress, progressPercent, start, reset }
}
