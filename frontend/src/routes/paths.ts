export const ROUTES = {
  scan: '/scan',
  new: '/new',
  newResults: '/new/results',
  report: '/report',
  scanning: '/scanning',
  history: (historyId: string) => `/history/${historyId}`,
} as const
