import { apiClient } from './client'

export type ReportStatus = 'DRAFT' | 'PUBLISHED'

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

export const reportsApi = {
  list:     (params?: { childId?: string }) => apiClient.get<Report[]>('/reports', { params }),
  get:      (id: string)                    => apiClient.get<Report>(`/reports/${id}`),
  update:   (id: string, payload: { title?: string; content?: string; memo?: string }) =>
    apiClient.patch<Report>(`/reports/${id}`, payload),
  download: (id: string)                    => apiClient.get(`/reports/${id}/download`, { responseType: 'blob' }),
}
