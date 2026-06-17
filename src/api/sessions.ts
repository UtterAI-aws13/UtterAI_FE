import { apiClient } from './client'

export type SessionStatus =
  | 'CREATED'
  | 'AUDIO_UPLOADING'
  | 'AUDIO_UPLOADED'
  | 'ANALYSIS_REQUESTED'
  | 'ANALYSIS_PROCESSING'
  | 'ANALYSIS_COMPLETED'
  | 'REPORT_GENERATING'
  | 'REPORT_READY'
  | 'FAILED'
  | 'DELETED'

export interface Session {
  id: string
  patient_ref_id: string
  slp_id: string
  session_date: string
  session_type: string | null
  session_goal: string | null
  memo: string | null
  status: SessionStatus
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateSessionPayload {
  patient_ref_id: string
  session_date: string
  session_type?: string
  session_goal?: string
  memo?: string
}

export const sessionsApi = {
  list:   (params?: { patient_ref_id?: string; status?: SessionStatus }) =>
    apiClient.get<Session[]>('/sessions', { params }),
  get:    (id: string)                        => apiClient.get<Session>(`/sessions/${id}`),
  create: (payload: CreateSessionPayload)     => apiClient.post<Session>('/sessions', payload),
  update: (id: string, payload: { session_date?: string; session_type?: string; session_goal?: string; memo?: string; status?: SessionStatus }) =>
    apiClient.patch<Session>(`/sessions/${id}`, payload),
  delete: (id: string)                        => apiClient.delete(`/sessions/${id}`),
}
