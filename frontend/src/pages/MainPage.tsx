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
                className={`group relative overflow-hidden rounded-xl border px-4 py-4 text-left transition-all ${
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
          <section className="mx-auto w-full max-w-3xl animate-fade-in">
            <div className="mb-5 flex flex-col gap-2 text-center">
              <p className="text-sm text-purple-400">신규추가</p>
              <h2 className="text-2xl font-bold text-white">엑셀 기획서로 태그 생성 준비</h2>
              <p className="text-sm text-[#A1A1AA]">
                파일을 업로드하고 읽어들인 화면 정보를 확인한 뒤 태그 생성을 진행합니다.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2 shadow-2xl shadow-purple-950/10">
              <div className="rounded-xl border border-[#2A2A2A] bg-[#151515] p-5">
                <label
                  htmlFor="new-tag-excel"
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-8 text-center transition-all ${
                    uploadedFileName
                      ? 'border-emerald-700/70 bg-emerald-950/15'
                      : 'border-[#3A3A3A] bg-[#0F0F0F] hover:border-purple-700/70 hover:bg-purple-950/10'
                  }`}
                >
                  <span
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                      uploadedFileName ? 'bg-emerald-500 text-[#07130C]' : 'bg-[#242424] text-[#A1A1AA]'
                    }`}
                  >
                    {uploadedFileName ? <CheckCircle2 size={24} /> : <Upload size={24} />}
                  </span>
                  <span className="text-base font-semibold text-white">
                    {uploadedFileName ? '엑셀 업로드 완료' : '엑셀 파일 업로드'}
                  </span>
                  <span className="mt-2 text-sm text-[#71717A]">
                    {uploadedFileName ? uploadedFileName : '.xlsx, .xls, .csv 파일을 선택하세요'}
                  </span>
                  <span className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-[#D4D4D8]">
                    파일 선택
                  </span>
                </label>
                <input
                  id="new-tag-excel"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="sr-only"
                  onChange={handleExcelUpload}
                />
              </div>

              <div className="mt-2 rounded-xl border border-[#2A2A2A] bg-[#151515] p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">읽어들인 화면 정보</p>
                    <p className="mt-1 text-xs text-[#71717A]">업로드한 엑셀의 신규 화면 내용을 확인합니다.</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs ${
                    uploadedFileName
                      ? 'bg-emerald-950/40 text-emerald-300'
                      : 'bg-[#242424] text-[#71717A]'
                  }`}>
                    {uploadedFileName ? '확인 가능' : '대기 중'}
                  </span>
                </div>

                {uploadedFileName ? (
                  <div className="space-y-3">
                    {[
                      { label: '화면명', value: '엑셀 분석 후 표시 예정' },
                      { label: '기획 내용', value: '업로드 파일 기준 요약 예정' },
                      { label: '생성 대상 태그', value: '이벤트명과 파라미터 표시 예정' },
                    ].map(item => (
                      <div key={item.label} className="grid gap-2 rounded-lg border border-[#2A2A2A] bg-[#0F0F0F] p-3 md:grid-cols-[120px_1fr]">
                        <p className="text-xs font-medium text-[#71717A]">{item.label}</p>
                        <p className="text-sm text-[#D4D4D8]">{item.value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[#333] bg-[#0F0F0F] px-4 py-6 text-center">
                    <FileSpreadsheet size={24} className="mx-auto mb-2 text-[#52525B]" />
                    <p className="text-sm text-[#A1A1AA]">엑셀을 업로드하면 확인할 신규 화면 정보가 표시됩니다.</p>
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-[#2A2A2A] bg-[#111] p-4">
                <p className="text-xs text-[#71717A]">
                  {uploadedFileName ? '내용 확인 후 태그 생성을 진행할 수 있습니다.' : '태그 생성을 시작하려면 먼저 엑셀 파일을 업로드하세요.'}
                </p>
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
