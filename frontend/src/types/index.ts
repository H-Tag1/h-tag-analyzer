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
  judgment_source?: string
  rag_score?: number | null
}

export interface TrackedAnalysisItem {
  element_selector: string
  element_text: string
  bounding_box: BoundingBox
  tracking_description: string
  tracking_data: Record<string, unknown>
  detection_methods?: string[]
}

export interface ExcludedAnalysisItem {
  element_selector: string
  element_text: string
  bounding_box: BoundingBox
  exclusion_reason: string
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
  channel_id?: string | null
  channel_label?: string | null
  datalayer_events: Record<string, unknown>[]
  issues: AiAnalysisItem[]
  review_items?: AiAnalysisItem[]
  tracked_items: TrackedAnalysisItem[]
  excluded_items?: ExcludedAnalysisItem[]
  network_tags?: NetworkTagHit[]
}

export type ScanMode = 'single' | 'batch'

export type LoginMemberType = 'integrated' | 'simple'

export type ScanRangePreset = 'viewport' | 'top2' | 'full' | 'custom'

export interface ScanLoginCredentials {
  enabled: boolean
  memberType: LoginMemberType
  username: string
  password: string
}

export interface ScanRangeOptions {
  preset: ScanRangePreset
  startY?: number
  endY?: number
}

export interface ScanStartOptions {
  url: string
  fullScan: boolean
  trackingId: string
  login?: ScanLoginCredentials
  scanRange?: ScanRangeOptions
}

export const DEFAULT_TRACKING_ID = 'G-1NWKV3S1TW'

export interface GeneratedCodeSnapshot {
  page_url: string
  code: string
  issue_count: number
  generated_at: string
}

export interface TagRequestItem {
  sheet_name: string
  row_number: number
  request_no: string
  event_name: string
  ep_button_area: string
  ep_button_area2: string
  ep_button_name: string
  examples: Record<string, string[]>
}

export interface TagRequestMatch {
  event_name: string
  ep_button_area: string
  ep_button_area2: string
  ep_button_name: string
  trigger: string
}

export interface TagRequestSubstitution {
  field: string
  placeholder: string
  value: string
}

export interface TagRequestCodeTarget {
  target_id: string
  selector: string
  reference_code: string
  source: 'reference' | 'rag' | 'runtime' | string
}

export interface TagRequestCandidateResult {
  candidate_key: string
  element_selector: string
  element_text: string
  status: 'normal' | 'missing' | 'review'
  click_tested: boolean
  bounding_box?: BoundingBox | null
  missing_fields: string[]
  substitutions: TagRequestSubstitution[]
  matched_tag?: TagRequestMatch | null
  reference_rule_ids?: string[]
  reason: string
}

export interface TagRequestValidationItem {
  request: TagRequestItem
  status: 'normal' | 'missing' | 'review'
  missing_fields: string[]
  bounding_box?: BoundingBox | null
  substitutions: TagRequestSubstitution[]
  match_source: 'rule' | 'ai' | string
  judgment_source: 'rule' | 'rag' | string
  judgment_reason: string
  rag_score?: number | null
  matched_tag?: TagRequestMatch | null
  candidate_count: number
  tested_count: number
  matched_count: number
  missing_candidate_count: number
  review_candidate_count: number
  candidate_results: TagRequestCandidateResult[]
  code_targets?: TagRequestCodeTarget[]
}

export interface ScreenshotSegment {
  screenshot_id: string
  offset_y: number
  width: number
  height: number
}

export interface TagRequestSheetResult {
  sheet_name: string
  url?: string | null
  event_name?: string | null
  screenshot_id?: string | null
  screenshot_width: number
  screenshot_height: number
  screenshot_segments?: ScreenshotSegment[]
  element_count: number
  total_count: number
  normal_count: number
  missing_count: number
  review_count: number
  error?: string | null
  items: TagRequestValidationItem[]
}

export interface TagRequestValidationResponse {
  file_name: string
  total_count: number
  normal_count: number
  missing_count: number
  review_count: number
  sheets: TagRequestSheetResult[]
}

export interface TagRequestProgressContext {
  sheetIndex: number
  sheetTotal: number
  sheetName: string
  url: string
}

export type TagRequestValidationEvent =
  | { type: 'validation_start'; sheetTotal: number }
  | ({ type: 'sheet_start'; itemTotal: number } & TagRequestProgressContext)
  | ({ type: 'page_loaded' } & TagRequestProgressContext)
  | ({ type: 'elements_collected'; count: number } & TagRequestProgressContext)
  | ({ type: 'click_scan_start'; current: number; total: number } & TagRequestProgressContext)
  | ({ type: 'click_scan_progress'; current: number; total: number } & TagRequestProgressContext)
  | ({ type: 'tracking_collected'; elementCount: number } & TagRequestProgressContext)
  | ({ type: 'capture_start' } & TagRequestProgressContext)
  | ({ type: 'capture_done'; segmentCount: number } & TagRequestProgressContext)
  | ({ type: 'matching_start'; itemTotal: number } & TagRequestProgressContext)
  | ({ type: 'matching_progress'; current: number; total: number } & TagRequestProgressContext)
  | ({ type: 'ai_matching_start'; itemTotal: number } & TagRequestProgressContext)
  | ({ type: 'ai_matching_done'; matchedCount: number } & TagRequestProgressContext)
  | ({ type: 'matching_done'; itemTotal: number } & TagRequestProgressContext)
  | ({
      type: 'sheet_complete'
      normalCount: number
      missingCount: number
      reviewCount: number
      hasError: boolean
    } & TagRequestProgressContext)
  | { type: 'validation_complete'; data: TagRequestValidationResponse }
  | { type: 'error'; message: string }

export interface ScanHistorySummary {
  id: string
  url: string
  mode: ScanMode
  full_scan: boolean
  tracking_id: string
  page_count: number
  issue_count: number
  review_count?: number
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
  | { type: 'click_scan_start'; current: number; total: number }
  | { type: 'click_scan_progress'; current: number; total: number }
  | { type: 'ai_analyzing' }
  | { type: 'scan_complete'; data: PageScanData; history_id?: string }
  | { type: 'pages_discovered'; urls: string[]; total: number }
  | { type: 'page_start'; url: string; index: number; total: number }
  | { type: 'page_complete'; url: string; index: number; data: PageScanData }
  | { type: 'page_error'; url: string; message: string }
  | { type: 'batch_complete'; pages: PageScanData[]; history_id?: string }
  | { type: 'error'; message: string }
