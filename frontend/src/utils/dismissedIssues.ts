import type { AiAnalysisItem } from '../types'
import type { TagSpec } from './tagSpec'

export function issueIdentityKey(issue: AiAnalysisItem): string {
  const eventName = String(issue.recommended_ga_spec?.event_name ?? issue.element_selector ?? '').trim()
  return eventName || `${issue.element_selector.trim()}|${issue.element_text.trim()}`
}

export async function dismissIssue(
  pageUrl: string,
  issue: AiAnalysisItem,
  tag: TagSpec,
): Promise<void> {
  const res = await fetch('/api/dismissed-issues', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      page_url: pageUrl,
      element_selector: issue.element_selector,
      element_text: issue.element_text,
      event_name: tag.event_name,
      ep_button_area: tag.ep_button_area,
      ep_button_area2: tag.ep_button_area2,
      ep_button_name: tag.ep_button_name,
    }),
  })
  if (!res.ok) {
    throw new Error('제외 처리에 실패했습니다.')
  }
}
