import { apiClient } from './client'

export type SoapNoteStatus = 'DRAFT' | 'SAVED' | 'FINALIZED' | 'DELETED'

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
  status: SoapNoteStatus
  created_at: string
  updated_at: string
}

export interface GenerateSoapNotePayload {
  sessionId: string
  transcriptId: string
  clinicalAnalysisJobId?: string | null
}

export interface UpdateSoapNotePayload {
  subjective?: string | null
  objective?: string | null
  assessment?: string | null
  plan?: string | null
}

export const soapNoteApi = {
  generate: (payload: GenerateSoapNotePayload) =>
    apiClient.post<SoapNote>('/soap-notes/generate', payload),

  list: (params?: { sessionId?: string; childId?: string }) =>
    apiClient.get<SoapNote[]>('/soap-notes', { params }),

  get: (noteId: string) =>
    apiClient.get<SoapNote>(`/soap-notes/${noteId}`),

  update: (noteId: string, payload: UpdateSoapNotePayload) =>
    apiClient.patch<SoapNote>(`/soap-notes/${noteId}`, payload),

  save: (noteId: string) =>
    apiClient.patch<SoapNote>(`/soap-notes/${noteId}/save`),

  finalize: (noteId: string) =>
    apiClient.patch<SoapNote>(`/soap-notes/${noteId}/finalize`),

  delete: (noteId: string) =>
    apiClient.delete<SoapNote>(`/soap-notes/${noteId}`),
}
