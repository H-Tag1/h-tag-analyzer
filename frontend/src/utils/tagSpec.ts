export interface TagSpec {
  event_name: string
  ep_button_area: string
  ep_button_area2: string
  ep_button_name: string
}

export function normalizeTagSpec(gaSpec: Record<string, unknown>): TagSpec {
  return {
    event_name: String(gaSpec.event_name ?? gaSpec.event ?? ''),
    ep_button_area: String(gaSpec.ep_button_area ?? ''),
    ep_button_area2: String(gaSpec.ep_button_area2 ?? ''),
    ep_button_name: String(gaSpec.ep_button_name ?? ''),
  }
}

export function mergeTagSpec(existing: TagSpec, suggested: TagSpec): TagSpec {
  return {
    event_name: existing.event_name.trim() || suggested.event_name.trim(),
    ep_button_area: existing.ep_button_area.trim() || suggested.ep_button_area.trim(),
    ep_button_area2: existing.ep_button_area2.trim() || suggested.ep_button_area2.trim(),
    ep_button_name: existing.ep_button_name.trim() || suggested.ep_button_name.trim(),
  }
}

export function toGaSpec(tag: TagSpec, elementSelector: string): Record<string, unknown> {
  return {
    element_selector: elementSelector,
    event_name: tag.event_name.trim(),
    ep_button_area: tag.ep_button_area.trim(),
    ep_button_area2: tag.ep_button_area2.trim(),
    ep_button_name: tag.ep_button_name.trim(),
    is_virtual: false,
  }
}
