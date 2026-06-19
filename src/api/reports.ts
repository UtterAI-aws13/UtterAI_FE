import { apiClient } from './client'

export type ReportStatus = 'DRAFT' | 'REVIEWING' | 'APPROVED' | 'FINALIZED' | 'DELETED'
export type ReportSegmentType = 'SUBJECTIVE' | 'OBJECTIVE' | 'ASSESSMENT' | 'PLAN' | 'CUSTOM'

export interface Report {
  id: string
  session_id: string
  job_id: string
  template_id: string | null
  status: ReportStatus
  model_used: string | null
  clinical_flags: unknown[] | null
  evidence_chunk_ids: unknown[] | null
  requires_human_review: boolean
  s3_key: string | null
  generated_at: string | null
  updated_at: string
}

export interface ReportSegment {
  id: string
  report_id: string
  segment_type: ReportSegmentType
  segment_index: number
  title: string | null
  ai_content: string | null
  content: string | null
  is_edited: boolean
  edited_by: string | null
  edited_at: string | null
  created_at: string
}

export const reportsApi = {
  list: (params?: { session_id?: string; patient_ref_id?: string }) =>
    apiClient.get<Report[]>('/reports', { params }),
  get:  (id: string) => apiClient.get<Report>(`/reports/${id}`),

  listSegments: (reportId: string) =>
    apiClient.get<ReportSegment[]>(`/reports/${reportId}/segments`),
  updateSegment: (reportId: string, segmentId: string, payload: { content?: string; title?: string }) =>
    apiClient.patch<ReportSegment>(`/reports/${reportId}/segments/${segmentId}`, payload),

  updateStatus: (reportId: string, status: ReportStatus) =>
    apiClient.patch<Report>(`/reports/${reportId}/status`, { status }),

  download: (id: string) => apiClient.get(`/reports/${id}/download`, { responseType: 'blob' }),
}
