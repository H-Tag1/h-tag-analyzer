import { useState, useEffect } from 'react'

interface Props {
  spec: Record<string, unknown>
  onChange: (spec: Record<string, unknown>) => void
}

export default function GaSpecEditor({ spec, onChange }: Props) {
  const [raw, setRaw] = useState(JSON.stringify(spec, null, 2))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setRaw(JSON.stringify(spec, null, 2))
    setError(null)
  }, [spec])

  const handleChange = (val: string) => {
    setRaw(val)
    try {
      onChange(JSON.parse(val))
      setError(null)
    } catch {
      setError('올바른 JSON 형식이 아닙니다')
    }
  }

  return (
    <div>
      <textarea
        value={raw}
        onChange={e => handleChange(e.target.value)}
        className="w-full h-40 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-3 text-xs font-mono text-[#A1A1AA] focus:outline-none focus:border-purple-600 resize-none"
        spellCheck={false}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}
