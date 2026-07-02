import { useState } from 'react'
import { CheckCircle2, FileSpreadsheet, SearchCheck, Upload, WandSparkles } from 'lucide-react'
import InputPage from './InputPage'

interface Props {
  onScanStart: (url: string, fullScan: boolean) => void
}

type MainTab = 'scan' | 'new'

export default function MainPage({ onScanStart }: Props) {
  const [activeTab, setActiveTab] = useState<MainTab>('scan')
  const [uploadedFileName, setUploadedFileName] = useState('')

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setUploadedFileName(file?.name ?? '')
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] px-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-purple-900/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[360px] h-[360px] rounded-full bg-blue-900/10 blur-3xl" />
      </div>

      <main className="relative z-10 w-full max-w-4xl mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <p className="text-sm text-purple-400 mb-3">AI Vision GA4 Analyzer</p>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">H-Tag Analyzer</h1>
          <p className="text-[#A1A1AA] text-lg leading-relaxed">
            웹 화면의 GA4 태그를 검사하거나 신규 화면의 태그 생성을 준비합니다.
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-1">
            <button
              type="button"
              onClick={() => setActiveTab('scan')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
                activeTab === 'scan'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/30'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <SearchCheck size={16} />
              검사하기
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('new')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
                activeTab === 'new'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/30'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <FileSpreadsheet size={16} />
              신규추가
            </button>
          </div>
        </div>

        {activeTab === 'scan' ? (
          <InputPage onStart={onScanStart} layout="embedded" />
        ) : (
          <section className="mx-auto w-full max-w-3xl animate-fade-in">
            <div className="mb-5 text-center">
              <p className="text-sm text-purple-400 mb-2">신규추가</p>
              <h2 className="text-2xl font-bold text-white">엑셀 기반 태그 생성</h2>
              <p className="mt-2 text-sm text-[#A1A1AA]">
                신규 화면 기획서 엑셀을 업로드하면 내용을 확인한 뒤 태그 생성을 진행합니다.
              </p>
            </div>

            <div className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-5">
              <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/20 p-5 text-center">
                <p className="mb-4 text-sm font-medium text-red-200">엑셀에서 읽어드린 화면</p>

                <label
                  htmlFor="new-tag-excel"
                  className="mx-auto inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-[#07130C] hover:bg-emerald-400 transition-colors"
                >
                  <Upload size={16} />
                  엑셀 업로드
                </label>
                <input
                  id="new-tag-excel"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="sr-only"
                  onChange={handleExcelUpload}
                />

                {uploadedFileName && (
                  <div className="mx-auto mt-4 flex max-w-md items-center justify-center gap-2 rounded-lg border border-emerald-800/60 bg-emerald-950/20 px-3 py-2 text-sm text-emerald-300">
                    <CheckCircle2 size={16} />
                    <span className="truncate">{uploadedFileName}</span>
                  </div>
                )}
              </div>

              {uploadedFileName ? (
                <div className="mb-4 grid gap-3 md:grid-cols-3">
                  {[
                    { label: '화면명', value: '엑셀 분석 후 표시 예정' },
                    { label: '기획 내용', value: '업로드 파일 기준 요약 예정' },
                    { label: '태그 항목', value: '생성 대상 이벤트 표시 예정' },
                  ].map(item => (
                    <div key={item.label} className="rounded-lg border border-[#2A2A2A] bg-[#0F0F0F] p-4">
                      <p className="mb-1 text-xs text-[#52525B]">{item.label}</p>
                      <p className="text-sm text-[#D4D4D8]">{item.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-4 rounded-lg border border-dashed border-[#3A3A3A] bg-[#0F0F0F] px-4 py-5 text-center">
                  <FileSpreadsheet size={24} className="mx-auto mb-2 text-[#52525B]" />
                  <p className="text-sm text-[#A1A1AA]">업로드 후 엑셀에서 읽은 신규 화면 정보가 여기에 표시됩니다.</p>
                </div>
              )}

              <button
                type="button"
                disabled={!uploadedFileName}
                className="mx-auto flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:from-purple-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <WandSparkles size={16} />
                태그 생성
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
