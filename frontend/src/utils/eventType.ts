export function isPageViewEvent(eventName?: string | null): boolean {
  return (eventName || '').trim().toLowerCase() === 'page_view'
}
