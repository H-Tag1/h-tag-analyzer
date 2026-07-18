import type { TagSpec } from '../utils/tagSpec'

interface Props {
  value: TagSpec
  onChange: (value: TagSpec) => void
  readOnly?: boolean
}

const FIELDS: { key: keyof TagSpec; label: string }[] = [
  { key: 'event_name', label: '이벤트 이름' },
  { key: 'ep_button_area', label: 'ep_button_area' },
  { key: 'ep_button_area2', label: 'ep_button_area2' },
  { key: 'ep_button_name', label: 'ep_button_name' },
]

export default function TagSpecEditor({ value, onChange, readOnly = false }: Props) {
  const update = (key: keyof TagSpec, next: string) => {
    onChange({ ...value, [key]: next })
  }

  return (
    <div className="space-y-2.5">
      {FIELDS.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-2">
          <label className="text-xs text-[#A1A1AA] whitespace-nowrap flex-shrink-0 w-[118px]">
            {label}
          </label>
          <span className="text-[#52525B] text-xs">:</span>
          <input
            type="text"
            value={value[key]}
            readOnly={readOnly}
            onChange={e => update(key, e.target.value)}
            className={`flex-1 min-w-0 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-600 ${
              readOnly ? 'opacity-80 cursor-default' : ''
            }`}
          />
        </div>
      ))}
    </div>
  )
}
