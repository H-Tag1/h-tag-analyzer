interface Props {
  trackingData: Record<string, unknown>
}

const TRACKING_FIELDS = [
  { key: 'event_name' as const, label: '이벤트 이름' },
  { key: 'ep_button_area' as const, label: 'ep_button_area' },
  { key: 'ep_button_area2' as const, label: 'ep_button_area2' },
  { key: 'ep_button_name' as const, label: 'ep_button_name' },
] as const

export default function TagParamsTable({ trackingData }: Props) {
  const params = {
    event_name: String(trackingData.event_name ?? trackingData.event ?? ''),
    ep_button_area: String(trackingData.ep_button_area ?? ''),
    ep_button_area2: String(trackingData.ep_button_area2 ?? ''),
    ep_button_name: String(trackingData.ep_button_name ?? ''),
  }

  return (
    <table className="w-full text-xs border-collapse">
      <tbody>
        {TRACKING_FIELDS.map(({ key, label }) => (
          <tr key={key} className="border-b border-[#2A2A2A]/60 last:border-0">
            <td className="py-1.5 pr-2 text-[#52525B] whitespace-nowrap align-top font-mono">
              {label}
            </td>
            <td className="py-1.5 text-white break-all">
              {params[key] || <span className="text-[#52525B]">-</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
