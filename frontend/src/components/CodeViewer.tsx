import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface Props {
  code: string
}

export default function CodeViewer({ code }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <pre className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-3 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all">
        {code}
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 p-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[#52525B] hover:text-white transition-colors"
        title="복사"
      >
        {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
      </button>
    </div>
  )
}
