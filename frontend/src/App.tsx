import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import './index.css'
import MainPage from './pages/MainPage'
import ScanningPage from './pages/ScanningPage'
import AnalysisPage from './pages/AnalysisPage'
import HistoryDetailPage from './pages/HistoryDetailPage'
import TagRequestResultPage from './pages/TagRequestResultPage'
import { useScan } from './hooks/useScan'
import { ROUTES } from './routes/paths'
import type { ScanStartOptions, TagRequestValidationResponse } from './types'

function HistoryDetailRoute() {
  const { historyId } = useParams()
  const navigate = useNavigate()

  if (!historyId) {
    return <Navigate to={ROUTES.report} replace />
  }

  return (
    <HistoryDetailPage
      historyId={historyId}
      onBack={() => navigate(ROUTES.report)}
    />
  )
}

function TagRequestResultRoute() {
  const location = useLocation()
  const navigate = useNavigate()
  const result = (location.state as { result?: TagRequestValidationResponse } | null)?.result

  if (!result) {
    return <Navigate to={ROUTES.new} replace />
  }

  return (
    <TagRequestResultPage
      result={result}
      onBack={() => navigate(ROUTES.new)}
    />
  )
}

interface ScanningViewProps {
  targetUrl: string
  onBack: () => void
  step: ReturnType<typeof useScan>['step']
  error: ReturnType<typeof useScan>['error']
  pages: ReturnType<typeof useScan>['pages']
  historyId: ReturnType<typeof useScan>['historyId']
  batchProgress: ReturnType<typeof useScan>['batchProgress']
  interactionProgress: ReturnType<typeof useScan>['interactionProgress']
  progressPercent: ReturnType<typeof useScan>['progressPercent']
}

function ScanningView({
  targetUrl,
  onBack,
  step,
  error,
  pages,
  historyId,
  batchProgress,
  interactionProgress,
  progressPercent,
}: ScanningViewProps) {
  if (step === 'idle') {
    return <Navigate to={ROUTES.scan} replace />
  }

  if (step === 'done' && historyId) {
    return <Navigate to={ROUTES.history(historyId)} replace />
  }

  if (step === 'done' && pages.length > 0) {
    return (
      <AnalysisPage
        pages={pages}
        onBack={onBack}
        historyId={historyId}
      />
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={onBack} className="text-sm text-[#52525B] hover:text-white transition-colors">
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
      onCancel={onBack}
    />
  )
}

function AppRoutes() {
  const navigate = useNavigate()
  const scan = useScan()
  const [targetUrl, setTargetUrl] = useState('')

  const handleStart = (options: ScanStartOptions) => {
    setTargetUrl(options.url)
    scan.start(options)
    navigate(ROUTES.scanning)
  }

  const handleScanBack = () => {
    scan.reset()
    setTargetUrl('')
    navigate(ROUTES.scan)
  }

  const handleTagRequestValidated = (result: TagRequestValidationResponse) => {
    navigate(ROUTES.newResults, { state: { result } })
  }

  const mainPageProps = {
    onScanStart: handleStart,
    onOpenHistoryDetail: (id: string) => navigate(ROUTES.history(id)),
    onTagRequestValidated: handleTagRequestValidated,
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.scan} replace />} />
      <Route path={ROUTES.scan} element={<MainPage section="scan" {...mainPageProps} />} />
      <Route path={ROUTES.new} element={<MainPage section="new" {...mainPageProps} />} />
      <Route path={ROUTES.report} element={<MainPage section="report" {...mainPageProps} />} />
      <Route
        path={ROUTES.scanning}
        element={(
          <ScanningView
            targetUrl={targetUrl}
            onBack={handleScanBack}
            step={scan.step}
            error={scan.error}
            pages={scan.pages}
            historyId={scan.historyId}
            batchProgress={scan.batchProgress}
            interactionProgress={scan.interactionProgress}
            progressPercent={scan.progressPercent}
          />
        )}
      />
      <Route path="/history/:historyId" element={<HistoryDetailRoute />} />
      <Route path={ROUTES.newResults} element={<TagRequestResultRoute />} />
      <Route path="*" element={<Navigate to={ROUTES.scan} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
