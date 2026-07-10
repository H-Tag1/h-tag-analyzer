import { Activity, Cpu, Globe, MousePointerClick } from 'lucide-react'
import type { ScanStep, BatchProgress, InteractionProgress } from '../hooks/useScan'

interface Props {
  step: ScanStep
  url: string
  batchProgress: BatchProgress | null
  interactionProgress: InteractionProgress | null
  progressPercent: number
  onCancel: () => void
}

const STEPS: { key: ScanStep; label: string; icon: React.ReactNode }[] = [
  { key: 'loading',      label: '페이지 접속 중',     icon: <Globe size={16} /> },
  { key: 'collecting',   label: '클릭 요소 확인 중',  icon: <MousePointerClick size={16} /> },
  { key: 'screenshot',   label: 'GA 이벤트 수집 중',  icon: <Activity size={16} /> },
  { key: 'ai_analyzing', label: '분석 결과 생성 중',  icon: <Cpu size={16} /> },
]

const ORDER: ScanStep[] = ['loading', 'collecting', 'screenshot', 'ai_analyzing']

export default function ScanningPage({ step, url, batchProgress, interactionProgress, progressPercent, onCancel }: Props) {
  const currentIdx = ORDER.indexOf(step)
  const displayPercent = Math.max(0, Math.min(100, Math.round(progressPercent)))
  const activeStepLabel = STEPS.find(s => s.key === step)?.label ?? '검사 진행 중'
  const interactionPercent = interactionProgress && interactionProgress.total > 0
    ? Math.round((interactionProgress.current / interactionProgress.total) * 100)
    : 0

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-900/30">
          <Cpu size={28} className="text-white animate-pulse" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          {batchProgress ? '전체 도메인 스캔 중' : activeStepLabel}
        </h2>
        <p className="text-[#52525B] text-sm mb-8 truncate max-w-xs mx-auto" title={url}>{url}</p>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-[#71717A]">진행률</span>
            <span className="font-mono text-purple-300">{displayPercent}%</span>
          </div>
          {interactionProgress && step === 'collecting' && (
            <div className="mb-2 flex items-center justify-between text-xs text-[#71717A]">
              <span>클릭 요소</span>
              <span className="font-mono">
                {interactionProgress.current} / {interactionProgress.total}개 ({interactionPercent}%)
              </span>
            </div>
          )}
          <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${displayPercent}%` }}
            />
          </div>
        </div>

        {batchProgress && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-[#52525B] mb-1">
              <span>{batchProgress.current} / {batchProgress.total} 페이지</span>
              <span>{Math.round((batchProgress.current / batchProgress.total) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
              />
            </div>
            {batchProgress.currentUrl && (
              <p className="text-xs text-[#52525B] mt-2 truncate">{batchProgress.currentUrl}</p>
            )}
          </div>
        )}

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 mb-8 text-left space-y-3">
          {STEPS.map((s, i) => {
            const isDone = i < currentIdx
            const isActive = i === currentIdx

            return (
              <div key={s.key} className={`flex items-center gap-3 text-sm transition-all ${
                isDone ? 'text-emerald-400' : isActive ? 'text-white' : 'text-[#3A3A3A]'
              }`}>
                <span className={`flex-shrink-0 ${isActive ? 'animate-spin' : ''}`}>
                  {isDone ? (
                    <span className="w-4 h-4 flex items-center justify-center text-emerald-400">✓</span>
                  ) : s.icon}
                </span>
                <span>{s.label}</span>
                {isActive && (
                  <span className="ml-auto text-xs text-[#52525B] animate-pulse">
                    {s.key === 'collecting' && interactionProgress
                      ? `${interactionProgress.current}/${interactionProgress.total}`
                      : '진행 중'}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={onCancel}
          className="text-sm text-[#52525B] hover:text-white transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  )
}
