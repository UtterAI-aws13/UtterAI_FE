import { apiClient } from './client'

export type ReportStatus = 'READY' | 'REGENERATING' | 'DELETED'

export interface Report {
  id: string
  session_id: string
  result_id: string | null
  soap_note_id: string | null
  generated_by: string
  title: string
  template_type: string
  content: string
  memo: string | null
  status: ReportStatus
  created_at: string
  updated_at: string
}

export interface CreateReportPayload {
  sessionId: string
  resultId: string
  templateType: string
}

export interface UpdateReportPayload {
  title?: string
  content?: string
  memo?: string
}

export const reportsApi = {
  list: (params?: { childId?: string }) =>
    apiClient.get<Report[]>('/reports', { params }),

  get: (id: string) =>
    apiClient.get<Report>(`/reports/${id}`),

  create: (payload: CreateReportPayload) =>
    apiClient.post<Report>('/reports', payload),

  update: (id: string, payload: UpdateReportPayload) =>
    apiClient.patch<Report>(`/reports/${id}`, payload),

  // plain text 파일 다운로드
  download: (id: string) =>
    apiClient.get(`/reports/${id}/download`, { responseType: 'blob' }),
}
