import { apiClient } from './client'

export type SessionStatus =
  | 'CREATED'
  | 'AUDIO_UPLOADING'
  | 'AUDIO_UPLOADED'
  | 'ANALYSIS_REQUESTED'
  | 'ANALYSIS_PROCESSING'
  | 'ANALYSIS_COMPLETED'
  | 'REPORT_READY'
  | 'FAILED'
  | 'DELETED'

export interface Session {
  id: string
  child_id: string
  therapist_id: string
  session_date: string
  session_type: string | null
  memo: string | null
  status: SessionStatus
  created_at: string
  updated_at: string
}

export interface CreateSessionPayload {
  child_id: string
  session_date: string
  session_type?: string
  memo?: string
}

export const sessionsApi = {
  list:   (params?: { child_id?: string; status?: SessionStatus }) =>
    apiClient.get<Session[]>('/sessions', { params }),
  get:    (id: string)                        => apiClient.get<Session>(`/sessions/${id}`),
  create: (payload: CreateSessionPayload)     => apiClient.post<Session>('/sessions', payload),
  update: (id: string, payload: { session_date?: string; session_type?: string; memo?: string; status?: SessionStatus }) =>
    apiClient.patch<Session>(`/sessions/${id}`, payload),
  delete: (id: string)                        => apiClient.delete(`/sessions/${id}`),
}
