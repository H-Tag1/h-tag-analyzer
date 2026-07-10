import { useState } from 'react'
import { Search, Clock, ArrowRight, ArrowLeft, LockKeyhole, UserRound, Tag, Ruler, Eye, EyeOff } from 'lucide-react'
import type { LoginMemberType, ScanRangePreset, ScanStartOptions } from '../types'
import { DEFAULT_TRACKING_ID } from '../types'

interface Props {
  onStart: (options: ScanStartOptions) => void
  onBack?: () => void
  layout?: 'page' | 'embedded'
}

const HISTORY_KEY = 'htag_url_history'
const SCAN_RANGE_OPTIONS: { value: ScanRangePreset; label: string }[] = [
  { value: 'viewport', label: '현재 화면' },
  { value: 'top2', label: '상단 영역' },
  { value: 'full', label: '전체 페이지' },
  { value: 'custom', label: '구간 지정' },
]

export default function InputPage({ onStart, onBack, layout = 'page' }: Props) {
  const [url, setUrl] = useState('')
  const [trackingId, setTrackingId] = useState(DEFAULT_TRACKING_ID)
  const [loginEnabled, setLoginEnabled] = useState(false)
  const [memberType, setMemberType] = useState<LoginMemberType>('integrated')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [scanRangePreset, setScanRangePreset] = useState<ScanRangePreset>('top2')
  const [customStartY, setCustomStartY] = useState('0')
  const [customEndY, setCustomEndY] = useState('1800')
  const [history] = useState<string[]>(() => {
    const saved = localStorage.getItem(HISTORY_KEY)
    return saved ? JSON.parse(saved).slice(0, 5) : []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    if (!trackingId.trim()) return
    if (loginEnabled && (!username.trim() || !password)) return
    if (isCustomRangeInvalid) return

    const normalized = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`
    const customStart = Number(customStartY)
    const customEnd = Number(customEndY)
    const newHistory = [normalized, ...history.filter(h => h !== normalized)].slice(0, 5)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
    onStart({
      url: normalized,
      fullScan: false,
      trackingId: trackingId.trim().toUpperCase(),
      scanRange: scanRangePreset === 'custom'
        ? { preset: scanRangePreset, startY: customStart, endY: customEnd }
        : { preset: scanRangePreset },
      login: loginEnabled
        ? {
            enabled: true,
            memberType,
            username: username.trim(),
            password,
          }
        : undefined,
    })
  }

  const customStart = Number(customStartY)
  const customEnd = Number(customEndY)
  const isCustomRangeInvalid = (
    scanRangePreset === 'custom' &&
    (!Number.isFinite(customStart) || !Number.isFinite(customEnd) || customStart < 0 || customEnd <= customStart)
  )
  const isSubmitDisabled = (
    !url.trim() ||
    !trackingId.trim() ||
    (loginEnabled && (!username.trim() || !password)) ||
    isCustomRangeInvalid
  )

  const content = (
    <div className="relative z-10 mx-auto w-full max-w-2xl animate-fade-in">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#52525B] hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          메인으로
        </button>
      )}

      {layout === 'page' && (
        <div className="text-center mb-10">
          <p className="text-sm text-purple-400 mb-3">검사하기</p>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">검사 URL 입력</h1>
          <p className="text-[#A1A1AA] text-lg leading-relaxed">
            URL을 입력하면 AI가 스크린샷을 분석해<br />
            <span className="text-purple-400">누락된 GA4 태그</span>를 시각적으로 찾아드립니다.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525B]" />
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://www.hddfs.com"
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-4 pl-11 text-white placeholder-[#52525B] focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all text-base"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            검사 시작
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="mb-3">
          <label className="mb-1.5 flex items-center gap-2 text-xs text-[#52525B]">
            <Tag size={14} />
            GA4 Tracking ID
          </label>
          <input
            type="text"
            value={trackingId}
            onChange={e => setTrackingId(e.target.value.toUpperCase())}
            placeholder={DEFAULT_TRACKING_ID}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-[#52525B] focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all text-base font-mono"
          />
          <p className="mt-1.5 text-xs text-[#52525B]">입력한 Measurement ID의 태그만 분석합니다</p>
        </div>

        <div className="mb-3">
          <label className="mb-1.5 flex items-center gap-2 text-xs text-[#52525B]">
            <Ruler size={14} />
            검사 범위
          </label>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-1 md:grid-cols-4">
            {SCAN_RANGE_OPTIONS.map(item => (
              <button
                key={item.value}
                type="button"
                onClick={() => setScanRangePreset(item.value)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  scanRangePreset === item.value
                    ? 'bg-purple-600 text-white'
                    : 'text-[#71717A] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {scanRangePreset === 'custom' && (
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <input
                type="number"
                min="0"
                value={customStartY}
                onChange={e => setCustomStartY(e.target.value)}
                placeholder="시작 Y(px)"
                className="w-full rounded-lg border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-3 text-sm text-white placeholder-[#52525B] transition-all focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
              <input
                type="number"
                min="1"
                value={customEndY}
                onChange={e => setCustomEndY(e.target.value)}
                placeholder="종료 Y(px)"
                className="w-full rounded-lg border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-3 text-sm text-white placeholder-[#52525B] transition-all focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>
          )}
          {isCustomRangeInvalid && (
            <p className="mt-1.5 text-xs text-red-400">종료 Y는 시작 Y보다 커야 합니다</p>
          )}
        </div>

        <div
          className={`rounded-xl border transition-all ${
            loginEnabled ? 'border-purple-700 bg-purple-900/10' : 'border-[#2A2A2A] bg-[#1A1A1A]'
          }`}
        >
          <button
            type="button"
            onClick={() => setLoginEnabled(v => !v)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left"
          >
            <div className={`w-9 h-5 rounded-full relative transition-colors ${loginEnabled ? 'bg-purple-600' : 'bg-[#3A3A3A]'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${loginEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <LockKeyhole size={16} className={loginEnabled ? 'text-purple-400' : 'text-[#52525B]'} />
            <div>
              <p className="text-sm font-medium text-white">로그인 후 검사</p>
              <p className="text-xs text-[#52525B]">면세점 채널 ID/PW 로그인 후 해당 화면을 검사합니다</p>
            </div>
          </button>

          {loginEnabled && (
            <div className="border-t border-[#2A2A2A] px-4 pb-4 pt-3">
              <div className="mb-3 grid grid-cols-2 gap-2 rounded-lg bg-[#101010] p-1">
                {[
                  { value: 'integrated' as const, label: 'H.Point 통합회원' },
                  { value: 'simple' as const, label: '면세점간편회원' },
                ].map(item => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMemberType(item.value)}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-all ${
                      memberType === item.value
                        ? 'bg-purple-600 text-white'
                        : 'text-[#71717A] hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div className="relative">
                  <UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="아이디"
                    autoComplete="username"
                    className="w-full rounded-lg border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-3 pl-9 text-sm text-white placeholder-[#52525B] transition-all focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                </div>
                <div className="relative">
                  <LockKeyhole size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]" />
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="비밀번호"
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-3 pl-9 pr-10 text-sm text-white placeholder-[#52525B] transition-all focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(v => !v)}
                    title={passwordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
                    aria-label={passwordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#52525B] transition-colors hover:bg-white/[0.04] hover:text-white"
                  >
                    {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      {history.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[#52525B] text-sm mb-3">
            <Clock size={14} />
            <span>최근 분석</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map(h => (
              <button
                key={h}
                onClick={() => { setUrl(h) }}
                className="px-3 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[#A1A1AA] text-sm hover:border-purple-700 hover:text-white transition-all truncate max-w-[280px]"
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  )

  if (layout === 'embedded') return content

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-900/10 blur-3xl" />
      </div>

      {content}
    </div>
  )
}
