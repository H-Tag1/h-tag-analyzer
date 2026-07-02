import { useState } from 'react'
import './index.css'
import MainPage from './pages/MainPage'
import InputPage from './pages/InputPage'
import ScanningPage from './pages/ScanningPage'
import AnalysisPage from './pages/AnalysisPage'
import { useScan } from './hooks/useScan'

type Screen = 'main' | 'input' | 'scanning' | 'results'

export default function App() {
  const [screen, setScreen] = useState<Screen>('main')
  const [targetUrl, setTargetUrl] = useState('')
  const { step, error, pages, batchProgress, start, reset } = useScan()

  const handleStart = (url: string, fullScan: boolean) => {
    setTargetUrl(url)
    setScreen('scanning')
    start(url, fullScan)
  }

  const handleBack = () => {
    reset()
    setTargetUrl('')
    setScreen('main')
  }

  const handleScanBack = () => {
    reset()
    setScreen('input')
  }

  if (screen === 'main') return <MainPage onScanStart={() => setScreen('input')} />

  if (screen === 'input') return <InputPage onStart={handleStart} onBack={handleBack} />

  if ((screen === 'scanning' || screen === 'results') && step === 'done' && pages.length > 0) {
    return <AnalysisPage pages={pages} onBack={handleScanBack} />
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
        onCancel={handleScanBack}
      />
    )
  }

  return null
}
