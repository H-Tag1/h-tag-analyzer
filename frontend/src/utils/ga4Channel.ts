const CHANNELS: Record<string, { id: string; label: string }> = {
  'www.hddfs.com': { id: 'kr_pc', label: '국문 PC' },
  'cn.hd-dfs.com': { id: 'cn_pc', label: '중문 PC' },
  'en.hddfs.com': { id: 'en_pc', label: '영문 PC' },
  'm.hddfs.com': { id: 'kr_mo', label: '국문 MO' },
  'mcn.hd-dfs.com': { id: 'cn_mo', label: '중문 MO' },
  'men.hddfs.com': { id: 'en_mo', label: '영문 MO' },
}

export function resolveChannelFromUrl(url: string): { id: string; label: string } | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return CHANNELS[hostname] ?? null
  } catch {
    return null
  }
}

export function getPageChannelLabel(page: {
  url: string
  channel_label?: string | null
}): string | null {
  return page.channel_label ?? resolveChannelFromUrl(page.url)?.label ?? null
}
