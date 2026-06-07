import { useState, useRef, useCallback } from 'react'
import type { AnalyzeResult, Step } from '../types'

interface Progress {
  current: number
  total: number
  percent: number
  selectorCount: number
}

const initialSteps = (): Step[] => [
  { id: 'load',    label: '페이지 로드',       status: 'running' },
  { id: 'capture', label: 'GA JS 파일 캡처',  status: 'pending' },
  { id: 'verify',  label: 'DOM 셀렉터 검증',  status: 'pending' },
]

export function useAnalysis() {
  const [analyzing, setAnalyzing] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [steps, setSteps] = useState<Step[]>(initialSteps())
  const [progress, setProgress] = useState<Progress>({ current: 0, total: 0, percent: 0, selectorCount: 0 })
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const esRef = useRef<EventSource | null>(null)

  const updateStep = (id: string, status: Step['status'], detail?: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status, detail } : s))
  }

  const start = useCallback((url: string) => {
    setAnalyzing(true)
    setDone(false)
    setError(null)
    setResult(null)
    setSteps(initialSteps())
    setProgress({ current: 0, total: 0, percent: 0, selectorCount: 0 })

    const es = new EventSource(`/api/analyze?url=${encodeURIComponent(url)}`)
    esRef.current = es

    es.onmessage = (e) => {
      const event = JSON.parse(e.data)
      switch (event.type) {
        case 'started':
          updateStep('load', 'running')
          break

        case 'captured':
          updateStep('load',    'done')
          updateStep('capture', 'done', `${event.selectorCount}개 셀렉터`)
          updateStep('verify',  'running')
          setProgress(prev => ({ ...prev, total: event.selectorCount, selectorCount: event.selectorCount }))
          break

        case 'progress':
          setProgress({ current: event.current, total: event.total, percent: event.percent, selectorCount: event.total })
          break

        case 'complete':
          updateStep('verify', 'done')
          setResult(event.result)
          setAnalyzing(false)
          setDone(true)
          es.close()
          break

        case 'error':
          updateStep('load', 'error', event.message)
          setError(event.message)
          setAnalyzing(false)
          es.close()
          break
      }
    }

    es.onerror = () => {
      setError('연결이 끊어졌습니다. 서버 상태를 확인해주세요.')
      setAnalyzing(false)
      es.close()
    }
  }, [])

  const reset = useCallback(() => {
    esRef.current?.close()
    setAnalyzing(false)
    setDone(false)
    setError(null)
    setResult(null)
    setSteps(initialSteps())
    setProgress({ current: 0, total: 0, percent: 0, selectorCount: 0 })
  }, [])

  return { analyzing, done, error, steps, progress, result, start, reset }
}
