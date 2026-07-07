export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface AiAnalysisItem {
  element_selector: string
  element_text: string
  bounding_box: BoundingBox
  issue: string
  recommended_ga_spec: Record<string, unknown>
}

export interface TrackedAnalysisItem {
  element_selector: string
  element_text: string
  bounding_box: BoundingBox
  tracking_description: string
  tracking_data: Record<string, unknown>
  detection_methods?: string[]
}

export interface NetworkTagDisplayField {
  label: string
  value: string
}

export interface NetworkTagHit {
  event_name?: string | null
  trigger: string
  ep_button_area?: string | null
  ep_button_area2?: string | null
  ep_button_name?: string | null
  display_fields: NetworkTagDisplayField[]
}

export interface PageScanData {
  url: string
  screenshot_id: string
  screenshot_width: number
  screenshot_height: number
  element_count: number
  tracking_id?: string
  datalayer_events: Record<string, unknown>[]
  issues: AiAnalysisItem[]
  tracked_items: TrackedAnalysisItem[]
  network_tags?: NetworkTagHit[]
}

export type ScanMode = 'single' | 'batch'

export type LoginMemberType = 'integrated' | 'simple'

export interface ScanLoginCredentials {
  enabled: boolean
  memberType: LoginMemberType
  username: string
  password: string
}

export interface ScanStartOptions {
  url: string
  fullScan: boolean
  trackingId: string
  login?: ScanLoginCredentials
}

export const DEFAULT_TRACKING_ID = 'G-1NWKV3S1TW'

export interface GeneratedCodeSnapshot {
  page_url: string
  code: string
  issue_count: number
  generated_at: string
}

export interface ScanHistorySummary {
  id: string
  url: string
  mode: ScanMode
  full_scan: boolean
  tracking_id: string
  page_count: number
  issue_count: number
  tracked_count: number
  has_generated_code: boolean
  created_at: string
}

export interface ScanHistoryRecord extends ScanHistorySummary {
  pages: PageScanData[]
  generated_codes: GeneratedCodeSnapshot[]
}

export type ScanEventType =
  | { type: 'scan_start'; url: string; mode: ScanMode }
  | { type: 'screenshot_done'; screenshotId: string; width: number; height: number }
  | { type: 'elements_collected'; count: number }
  | { type: 'ai_analyzing' }
  | { type: 'scan_complete'; data: PageScanData; history_id?: string }
  | { type: 'pages_discovered'; urls: string[]; total: number }
  | { type: 'page_start'; url: string; index: number; total: number }
  | { type: 'page_complete'; url: string; index: number; data: PageScanData }
  | { type: 'page_error'; url: string; message: string }
  | { type: 'batch_complete'; pages: PageScanData[]; history_id?: string }
  | { type: 'error'; message: string }
