import { apiClient } from './client'

export interface SoapNote {
  id: string
  session_id: string
  result_id: string | null
  job_id: string | null
  generated_by: string
  subjective: string | null
  objective: string | null
  assessment: string | null
  plan: string | null
  status: string
  created_at: string
  updated_at: string
}

export const soapNoteApi = {
  generate: (payload: { sessionId: string; transcriptId: string; clinicalAnalysisJobId?: string }) =>
    apiClient.post<SoapNote>('/soap-notes/generate', payload),

  list: (params?: { sessionId?: string; patientId?: string }) =>
    apiClient.get<SoapNote[]>('/soap-notes', { params }),

  get:      (id: string) => apiClient.get<SoapNote>(`/soap-notes/${id}`),
  update:   (id: string, payload: { subjective?: string; objective?: string; assessment?: string; plan?: string }) =>
    apiClient.patch<SoapNote>(`/soap-notes/${id}`, payload),
  save:     (id: string) => apiClient.patch<SoapNote>(`/soap-notes/${id}/save`),
  finalize: (id: string) => apiClient.patch<SoapNote>(`/soap-notes/${id}/finalize`),
  delete:   (id: string) => apiClient.delete(`/soap-notes/${id}`),
}
