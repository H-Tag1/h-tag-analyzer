import { useState } from 'react'
import './index.css'
import MainPage, { type MainSection } from './pages/MainPage'
import ScanningPage from './pages/ScanningPage'
import AnalysisPage from './pages/AnalysisPage'
import HistoryDetailPage from './pages/HistoryDetailPage'
import TagRequestResultPage from './pages/TagRequestResultPage'
import { useScan } from './hooks/useScan'
import type { ScanStartOptions, TagRequestValidationResponse } from './types'

type Screen = 'main' | 'scanning' | 'results' | 'history-detail' | 'tag-request-results'

export default function App() {
  const [screen, setScreen] = useState<Screen>('main')
  const [targetUrl, setTargetUrl] = useState('')
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)
  const [mainSection, setMainSection] = useState<MainSection>('scan')
  const [tagRequestResult, setTagRequestResult] = useState<TagRequestValidationResponse | null>(null)
  const { step, error, pages, historyId, batchProgress, interactionProgress, progressPercent, start, reset } = useScan()

  const handleStart = (options: ScanStartOptions) => {
    setTargetUrl(options.url)
    setScreen('scanning')
    start(options)
  }

  const handleScanBack = () => {
    reset()
    setTargetUrl('')
    setScreen('main')
  }

  const handleOpenHistoryDetail = (id: string) => {
    setSelectedHistoryId(id)
    setScreen('history-detail')
  }

  const handleHistoryDetailBack = () => {
    setSelectedHistoryId(null)
    setMainSection('report')
    setScreen('main')
  }

  const handleTagRequestValidated = (result: TagRequestValidationResponse) => {
    setTagRequestResult(result)
    setScreen('tag-request-results')
  }

  const handleTagRequestBack = () => {
    setTagRequestResult(null)
    setMainSection('new')
    setScreen('main')
  }

  if (screen === 'main') {
    return (
      <MainPage
        onScanStart={handleStart}
        onOpenHistoryDetail={handleOpenHistoryDetail}
        onTagRequestValidated={handleTagRequestValidated}
        initialSection={mainSection}
      />
    )
  }

  if (screen === 'history-detail' && selectedHistoryId) {
    return <HistoryDetailPage historyId={selectedHistoryId} onBack={handleHistoryDetailBack} />
  }

  if (screen === 'tag-request-results' && tagRequestResult) {
    return <TagRequestResultPage result={tagRequestResult} onBack={handleTagRequestBack} />
  }

  if ((screen === 'scanning' || screen === 'results') && step === 'done' && pages.length > 0) {
    return <AnalysisPage pages={pages} onBack={handleScanBack} historyId={historyId} />
  }

  if (screen === 'scanning') {
    if (error) {
      return (
        <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={handleScanBack} className="text-sm text-[#52525B] hover:text-white transition-colors">
              돌아가기
            </button>
          </div>
        </div>
      )
    }
    return (
      <ScanningPage
        step={step}
        url={targetUrl}
        batchProgress={batchProgress}
        interactionProgress={interactionProgress}
        progressPercent={progressPercent}
        onCancel={handleScanBack}
      />
    )
  }

  return null
}
