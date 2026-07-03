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

export interface PageScanData {
  url: string
  screenshot_id: string
  screenshot_width: number
  screenshot_height: number
  element_count: number
  datalayer_events: Record<string, unknown>[]
  issues: AiAnalysisItem[]
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
  login?: ScanLoginCredentials
}

export type ScanEventType =
  | { type: 'scan_start'; url: string; mode: ScanMode }
  | { type: 'screenshot_done'; screenshotId: string; width: number; height: number }
  | { type: 'elements_collected'; count: number }
  | { type: 'ai_analyzing' }
  | { type: 'scan_complete'; data: PageScanData }
  | { type: 'pages_discovered'; urls: string[]; total: number }
  | { type: 'page_start'; url: string; index: number; total: number }
  | { type: 'page_complete'; url: string; index: number; data: PageScanData }
  | { type: 'page_error'; url: string; message: string }
  | { type: 'batch_complete'; pages: PageScanData[] }
  | { type: 'error'; message: string }
