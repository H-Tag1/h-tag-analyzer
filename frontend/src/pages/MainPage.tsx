import { useState } from 'react'
import { CheckCircle2, FileSpreadsheet, SearchCheck, Upload, WandSparkles } from 'lucide-react'
import InputPage from './InputPage'
import type { ScanStartOptions } from '../types'

interface Props {
  onScanStart: (options: ScanStartOptions) => void
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

        <div className="mx-auto mb-8 grid w-full max-w-2xl gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-2 shadow-2xl shadow-purple-950/10 backdrop-blur md:grid-cols-2">
          {[
            {
              key: 'scan' as const,
              label: '검사하기',
              desc: '운영 중인 화면의 누락 태그를 점검',
              icon: SearchCheck,
            },
            {
              key: 'new' as const,
              label: '신규추가',
              desc: '엑셀 기획서 기반 태그 생성 준비',
              icon: FileSpreadsheet,
            },
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`group relative overflow-hidden rounded-xl border px-4 py-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 ${
                  isActive
                    ? 'border-purple-500/50 bg-gradient-to-br from-purple-600/25 via-[#1A1A1A] to-blue-600/20 text-white shadow-lg shadow-purple-950/20'
                    : 'border-transparent bg-transparent text-[#A1A1AA] hover:border-white/10 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {isActive && (
                  <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-gradient-to-r from-purple-400 to-blue-400" />
                )}
                <span className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? 'bg-purple-500 text-white'
                        : 'bg-[#242424] text-[#71717A] group-hover:text-[#D4D4D8]'
                    }`}
                  >
                    <Icon size={19} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{tab.label}</span>
                    <span className="mt-0.5 block truncate text-xs text-[#71717A] group-hover:text-[#A1A1AA]">
                      {tab.desc}
                    </span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {activeTab === 'scan' ? (
          <InputPage onStart={onScanStart} layout="embedded" />
        ) : (
          <section className="mx-auto w-full max-w-2xl animate-fade-in">
            <div className="mb-5 text-center">
              <p className="text-sm text-purple-400">신규추가</p>
              <h2 className="mt-2 text-2xl font-bold text-white">엑셀 파일 업로드</h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#151515]/90 shadow-2xl shadow-purple-950/10">
              <label
                htmlFor="new-tag-excel"
                className={`group flex min-h-[220px] cursor-pointer flex-col items-center justify-center border-b border-white/10 px-6 py-10 text-center transition-all ${
                  uploadedFileName
                    ? 'bg-emerald-950/10'
                    : 'bg-[#111] hover:bg-purple-950/10'
                }`}
              >
                <span
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border transition-all ${
                    uploadedFileName
                      ? 'border-emerald-400/30 bg-emerald-400 text-[#07130C]'
                      : 'border-white/10 bg-white/[0.04] text-[#A1A1AA] group-hover:border-purple-500/40 group-hover:text-white'
                  }`}
                >
                  {uploadedFileName ? <CheckCircle2 size={26} /> : <Upload size={26} />}
                </span>
                <span className="text-lg font-semibold text-white">
                  {uploadedFileName ? '업로드 완료' : '파일을 선택하세요'}
                </span>
                <span className="mt-2 max-w-full truncate text-sm text-[#71717A]">
                  {uploadedFileName || '.xlsx, .xls, .csv'}
                </span>
              </label>

              <input
                id="new-tag-excel"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="sr-only"
                onChange={handleExcelUpload}
              />

              <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    uploadedFileName ? 'bg-emerald-950/40 text-emerald-300' : 'bg-[#242424] text-[#71717A]'
                  }`}>
                    <FileSpreadsheet size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {uploadedFileName || '업로드 대기 중'}
                    </p>
                    <p className="text-xs text-[#71717A]">
                      {uploadedFileName ? '태그 생성을 진행할 수 있습니다.' : '엑셀 파일을 먼저 업로드하세요.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!uploadedFileName}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-purple-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <WandSparkles size={16} />
                  태그 생성
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
