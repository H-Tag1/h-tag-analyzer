import { useEffect } from 'react'
import { CheckCircle, Circle, Loader, XCircle, ArrowLeft } from 'lucide-react'
import { useAnalysis } from '../hooks/useAnalysis'
import type { AnalyzeResult } from '../types'

interface Props {
  url: string
  onComplete: (result: AnalyzeResult) => void
  onBack: () => void
}

export default function AnalyzingPage({ url, onComplete, onBack }: Props) {
  const { analyzing, done, error, steps, progress, result, start } = useAnalysis()

  useEffect(() => {
    start(url)
  }, [url])

  useEffect(() => {
    if (done && result) onComplete(result)
  }, [done, result])

  const stepIcon = (status: string) => {
    if (status === 'done')    return <CheckCircle size={20} className="text-emerald-400 shrink-0" />
    if (status === 'running') return <Loader size={20} className="text-purple-400 shrink-0 animate-spin" />
    if (status === 'error')   return <XCircle size={20} className="text-red-400 shrink-0" />
    return <Circle size={20} className="text-[#3A3A3A] shrink-0" />
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg animate-fade-in">
        <div className="text-center mb-8">
          <p className="text-[#52525B] text-sm mb-1">분석 중</p>
          <p className="text-white font-medium truncate">{url}</p>
        </div>

        {/* 단계 목록 */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 mb-6 space-y-4">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-4">
              {stepIcon(step.status)}
              <div className="flex-1">
                <p className={`text-sm font-medium ${step.status === 'pending' ? 'text-[#52525B]' : 'text-white'}`}>
                  {step.label}
                </p>
                {step.detail && (
                  <p className="text-xs text-[#A1A1AA] mt-0.5">{step.detail}</p>
                )}
              </div>
              {step.status === 'running' && idx === 2 && progress.total > 0 && (
                <span className="text-xs text-purple-400 shrink-0">
                  {progress.current} / {progress.total}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* 진행 바 */}
        {progress.total > 0 && analyzing && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-[#52525B] mb-2">
              <span>DOM 검증 진행률</span>
              <span>{progress.percent}%</span>
            </div>
            <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* 뒤로 가기 */}
        {(error || !analyzing) && (
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 py-3 border border-[#2A2A2A] rounded-xl text-[#A1A1AA] hover:text-white hover:border-[#3A3A3A] transition-all text-sm"
          >
            <ArrowLeft size={16} />
            다른 URL 분석하기
          </button>
        )}
      </div>
    </div>
  )
}
