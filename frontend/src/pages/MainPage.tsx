import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, ClipboardList, FileSpreadsheet, Loader2, SearchCheck, Upload, WandSparkles } from 'lucide-react'
import InputPage from './InputPage'
import ReportTable from '../components/ReportTable'
import type { ScanStartOptions, TagRequestValidationResponse } from '../types'

export type MainSection = 'scan' | 'new' | 'report'

interface Props {
  onScanStart: (options: ScanStartOptions) => void
  onOpenHistoryDetail: (id: string) => void
  onTagRequestValidated: (result: TagRequestValidationResponse) => void
  initialSection?: MainSection
}

const NAV_ITEMS: { key: MainSection; label: string; icon: typeof SearchCheck }[] = [
  { key: 'scan', label: '검사하기', icon: SearchCheck },
  { key: 'new', label: '신규추가', icon: FileSpreadsheet },
  { key: 'report', label: '실행 리포트', icon: ClipboardList },
]

export default function MainPage({ onScanStart, onOpenHistoryDetail, onTagRequestValidated, initialSection = 'scan' }: Props) {
  const [activeSection, setActiveSection] = useState<MainSection>(initialSection)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isValidatingTagRequest, setIsValidatingTagRequest] = useState(false)
  const [tagRequestError, setTagRequestError] = useState<string | null>(null)

  useEffect(() => {
    setActiveSection(initialSection)
  }, [initialSection])

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setUploadedFile(file ?? null)
    setUploadedFileName(file?.name ?? '')
    setTagRequestError(null)
  }

  const handleValidateTagRequest = async () => {
    if (!uploadedFile) return

    setIsValidatingTagRequest(true)
    setTagRequestError(null)

    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)

      const response = await fetch('/api/tag-requests/validate', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.detail ?? '요청서 검증에 실패했습니다.')
      }

      onTagRequestValidated(data as TagRequestValidationResponse)
    } catch (error) {
      setTagRequestError(error instanceof Error ? error.message : '요청서 검증에 실패했습니다.')
    } finally {
      setIsValidatingTagRequest(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex">
      <aside className="w-56 flex-shrink-0 border-r border-[#2A2A2A] bg-[#111] flex flex-col">
        <div className="px-5 py-6 border-b border-[#2A2A2A]">
          <p className="text-[10px] uppercase tracking-wider text-purple-400 mb-1">GA4 Analyzer</p>
          <h1 className="text-lg font-bold text-white leading-tight">H-Tag Analyzer</h1>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const isActive = activeSection === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSection(key)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-white border border-purple-500/30'
                    : 'text-[#71717A] hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-purple-400' : ''} />
                {label}
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1 min-w-0 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[480px] h-[480px] rounded-full bg-purple-900/10 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-[320px] h-[320px] rounded-full bg-blue-900/10 blur-3xl" />
        </div>

        <main className="relative z-10 h-full overflow-y-auto px-6 py-10 lg:px-10">
          {activeSection === 'scan' && (
            <div className="mx-auto w-full max-w-2xl animate-fade-in">
              <div className="text-center mb-8">
                <p className="text-sm text-purple-400 mb-2">검사하기</p>
                <h2 className="text-3xl font-bold text-white mb-3">GA4 태그 검사</h2>
                <p className="text-[#A1A1AA] leading-relaxed">
                  운영 중인 화면의 누락 태그를 점검합니다.
                </p>
              </div>
              <InputPage onStart={onScanStart} layout="embedded" />
            </div>
          )}

          {activeSection === 'new' && (
            <section className="mx-auto w-full max-w-2xl animate-fade-in">
              <div className="mb-8 text-center">
                <p className="text-sm text-purple-400 mb-2">신규추가</p>
                <h2 className="text-3xl font-bold text-white mb-3">엑셀 파일 업로드</h2>
                <p className="text-[#A1A1AA] leading-relaxed">
                  엑셀 요청서 기준으로 실제 GA 태그 정상·누락 여부를 확인합니다.
                </p>
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
                    disabled={!uploadedFileName || isValidatingTagRequest}
                    onClick={handleValidateTagRequest}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-purple-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isValidatingTagRequest ? <Loader2 size={16} className="animate-spin" /> : <WandSparkles size={16} />}
                    {isValidatingTagRequest ? '검증 중' : '태그 생성'}
                  </button>
                </div>

                {tagRequestError && (
                  <div className="flex items-start gap-2 border-t border-red-500/20 bg-red-950/20 px-5 py-3 text-sm text-red-300">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{tagRequestError}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeSection === 'report' && (
            <div className="mx-auto w-full max-w-5xl">
              <ReportTable onOpenDetail={onOpenHistoryDetail} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
