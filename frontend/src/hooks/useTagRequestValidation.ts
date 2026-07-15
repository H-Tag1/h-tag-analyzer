import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  TagRequestProgressContext,
  TagRequestValidationEvent,
  TagRequestValidationResponse,
} from '../types'

export interface TagRequestValidationProgress {
  percent: number
  stageLabel: string
  sheetCurrent: number
  sheetTotal: number
  sheetName: string
  currentUrl: string
  interactionCurrent: number | null
  interactionTotal: number | null
}

const INITIAL_PROGRESS: TagRequestValidationProgress = {
  percent: 0,
  stageLabel: '업로드 대기 중',
  sheetCurrent: 0,
  sheetTotal: 0,
  sheetName: '',
  currentUrl: '',
  interactionCurrent: null,
  interactionTotal: null,
}

function overallPercent(context: TagRequestProgressContext, sheetPercent: number) {
  const sheetTotal = Math.max(1, context.sheetTotal)
  const completedSheets = Math.max(0, context.sheetIndex - 1)
  const ratio = (completedSheets + sheetPercent / 100) / sheetTotal
  return Math.min(98, Math.max(2, Math.round(2 + ratio * 96)))
}

function sheetProgress(
  context: TagRequestProgressContext,
  sheetPercent: number,
  stageLabel: string,
  interaction?: { current: number; total: number },
): TagRequestValidationProgress {
  return {
    percent: overallPercent(context, sheetPercent),
    stageLabel,
    sheetCurrent: context.sheetIndex,
    sheetTotal: context.sheetTotal,
    sheetName: context.sheetName,
    currentUrl: context.url,
    interactionCurrent: interaction?.current ?? null,
    interactionTotal: interaction?.total ?? null,
  }
}

export function useTagRequestValidation() {
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<TagRequestValidationProgress>(INITIAL_PROGRESS)
  const eventSourceRef = useRef<EventSource | null>(null)
  const requestAbortRef = useRef<AbortController | null>(null)

  const closeStream = useCallback(() => {
    requestAbortRef.current?.abort()
    requestAbortRef.current = null
    eventSourceRef.current?.close()
    eventSourceRef.current = null
  }, [])

  const reset = useCallback(() => {
    closeStream()
    setIsValidating(false)
    setError(null)
    setProgress(INITIAL_PROGRESS)
  }, [closeStream])

  useEffect(() => closeStream, [closeStream])

  const start = useCallback((
    file: File,
    onComplete: (result: TagRequestValidationResponse) => void,
  ) => {
    closeStream()
    setIsValidating(true)
    setError(null)
    setProgress({
      ...INITIAL_PROGRESS,
      percent: 1,
      stageLabel: '검증 세션 준비 중',
    })
    const requestController = new AbortController()
    requestAbortRef.current = requestController

    void (async () => {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/tag-request-sessions', {
          method: 'POST',
          body: formData,
          signal: requestController.signal,
        })
        const session = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(session?.detail ?? '요청서 검증 세션을 생성하지 못했습니다.')
        }
        if (!session?.validationId) {
          throw new Error('요청서 검증 세션 ID를 받지 못했습니다.')
        }
        if (requestController.signal.aborted) return

        const eventSource = new EventSource(
          `/api/tag-request-sessions/${session.validationId}/events`,
        )
        let streamFinished = false
        eventSourceRef.current = eventSource

        const fail = (message: string) => {
          if (streamFinished) return
          streamFinished = true
          setError(message)
          setIsValidating(false)
          eventSource.close()
          if (eventSourceRef.current === eventSource) {
            eventSourceRef.current = null
          }
          if (requestAbortRef.current === requestController) {
            requestAbortRef.current = null
          }
        }

        eventSource.onmessage = (message) => {
          let event: TagRequestValidationEvent
          try {
            event = JSON.parse(message.data) as TagRequestValidationEvent
          } catch {
            fail('검증 진행 정보를 읽지 못했습니다.')
            return
          }

          switch (event.type) {
            case 'validation_start':
              setProgress({
                ...INITIAL_PROGRESS,
                percent: 2,
                stageLabel: '엑셀 요청서 분석 완료',
                sheetTotal: event.sheetTotal,
              })
              break
            case 'sheet_start':
              setProgress(sheetProgress(event, 3, '검사 페이지 접속 중'))
              break
            case 'page_loaded':
              setProgress(sheetProgress(event, 7, '페이지 로딩 완료'))
              break
            case 'elements_collected':
              setProgress(sheetProgress(event, 10, `클릭 요소 ${event.count}개 수집 완료`))
              break
            case 'click_scan_start':
              setProgress(sheetProgress(
                event,
                12,
                'GA 클릭 이벤트 확인 중',
                { current: event.current, total: event.total },
              ))
              break
            case 'click_scan_progress': {
              const ratio = event.total > 0 ? event.current / event.total : 1
              setProgress(sheetProgress(
                event,
                12 + ratio * 63,
                'GA 클릭 이벤트 확인 중',
                { current: event.current, total: event.total },
              ))
              break
            }
            case 'tracking_collected':
              setProgress(sheetProgress(event, 78, 'GA 이벤트 수집 완료'))
              break
            case 'capture_start':
              setProgress(sheetProgress(event, 82, '결과 화면 캡처 중'))
              break
            case 'capture_done':
              setProgress(sheetProgress(event, 90, '결과 화면 캡처 완료'))
              break
            case 'matching_start':
              setProgress(sheetProgress(event, 93, '요청 항목 대조 중'))
              break
            case 'ai_matching_start':
              setProgress(sheetProgress(event, 95, 'AI 화면 위치 분석 중'))
              break
            case 'ai_matching_done':
              setProgress(sheetProgress(event, 97, 'AI 화면 위치 분석 완료'))
              break
            case 'matching_done':
              setProgress(sheetProgress(event, 98, '시트 검증 결과 정리 중'))
              break
            case 'sheet_complete':
              setProgress(sheetProgress(event, 100, '시트 검증 완료'))
              break
            case 'validation_complete':
              streamFinished = true
              setProgress((current) => ({
                ...current,
                percent: 100,
                stageLabel: '요청서 검증 완료',
                interactionCurrent: null,
                interactionTotal: null,
              }))
              setIsValidating(false)
              eventSource.close()
              if (eventSourceRef.current === eventSource) {
                eventSourceRef.current = null
              }
              if (requestAbortRef.current === requestController) {
                requestAbortRef.current = null
              }
              onComplete(event.data)
              break
            case 'error':
              fail(event.message)
              break
          }
        }

        eventSource.onerror = () => {
          fail('검증 서버 연결이 끊어졌습니다.')
        }
      } catch (caughtError) {
        if (requestController.signal.aborted) return
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : '요청서 검증을 시작하지 못했습니다.',
        )
        setIsValidating(false)
        if (requestAbortRef.current === requestController) {
          requestAbortRef.current = null
        }
      }
    })()
  }, [closeStream])

  return {
    isValidating,
    error,
    progress,
    start,
    reset,
  }
}
