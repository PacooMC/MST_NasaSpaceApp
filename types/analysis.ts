export type DetectionType = "fire" | "ship" | "flood"

export interface Detection {
  id: string
  type: DetectionType
  x: number
  y: number
  confidence: number
  label: string
}

export type SystemEventType = "detection" | "confirmation" | "report" | "processing" | "info"
export type SystemEventSeverity = "info" | "warning" | "critical"

export interface SystemEventPayload {
  id: string
  timestamp: string
  type: SystemEventType
  message: string
  confidence?: number
  coordinates?: string
  severity?: SystemEventSeverity
}

export interface SystemEvent extends Omit<SystemEventPayload, "timestamp"> {
  timestamp: Date
}

export interface AnalysisResponsePayload {
  success: boolean
  summary: string
  mode: string
  region: string
  scenarioId?: string
  detections: Detection[]
  events: SystemEventPayload[]
  rawModelOutput?: string
  error?: string
}

export interface AnalysisResult {
  summary: string
  mode: string
  region: string
  scenarioId?: string
  detections: Detection[]
  events: SystemEvent[]
  rawModelOutput?: string
}
