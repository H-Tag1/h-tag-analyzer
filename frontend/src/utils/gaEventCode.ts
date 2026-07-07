export interface GaEventSpec {
  element_selector?: string
  event_name?: string
  event?: string
  ep_button_area?: string
  ep_button_area2?: string
  ep_button_name?: string
  ep_button_name_type?: 'literal' | 'variable' | 'expression'
  ep_button_name_param?: string
  setup_lines?: string[]
  is_virtual?: boolean
}

function escapeJsString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function formatGaEventArg(value: string, argType: GaEventSpec['ep_button_name_type']): string {
  if (argType === 'variable' || argType === 'expression') {
    return value.trim()
  }
  return `"${escapeJsString(value)}"`
}

export function toGaEventCode(spec: GaEventSpec, fallbackSelector = ''): string {
  const selector = spec.element_selector || fallbackSelector
  const eventName = spec.event_name || spec.event || ''
  const epButtonArea = spec.ep_button_area || ''
  const epButtonArea2 = spec.ep_button_area2 || ''
  const epButtonName = spec.ep_button_name || ''
  const isVirtual = Boolean(spec.is_virtual)
  const setupLines = spec.setup_lines || []

  if (!selector || !eventName || !epButtonArea) {
    return `// GA_Event 스펙이 불완전합니다.\n${JSON.stringify(spec, null, 2)}`
  }

  const nameParam =
    spec.ep_button_name_param ??
    formatGaEventArg(epButtonName, spec.ep_button_name_type || 'literal')

  const gaArgs = [
    `"${escapeJsString(eventName)}"`,
    `"${escapeJsString(epButtonArea)}"`,
    `"${escapeJsString(epButtonArea2)}"`,
    nameParam,
  ]
  if (isVirtual) {
    gaArgs.push('true')
  }

  const lines = [`$(document).on("click", "${escapeJsString(selector)}", function(){`]
  for (const setupLine of setupLines) {
    lines.push(`\t${setupLine.replace(/;\s*$/, '')};`)
  }
  lines.push(`\tGA_Event(${gaArgs.join(', ')});`)
  lines.push('});')
  return lines.join('\n')
}
