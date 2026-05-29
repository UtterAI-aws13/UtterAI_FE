import { apiClient } from './client'

export interface Report {
  id: number
  sessionId: number
  childName: string
  date: string
  status: 'DRAFT' | 'PUBLISHED'
  mlu: number | null
}

export const reportsApi = {
  list: () =>
    apiClient.get<Report[]>('/reports/'),

  get: (id: number) =>
    apiClient.get<Report>(`/reports/${id}/`),

  publish: (id: number) =>
    apiClient.post<Report>(`/reports/${id}/publish/`),

  download: (id: number) =>
    apiClient.get(`/reports/${id}/pdf/`, { responseType: 'blob' }),
}
