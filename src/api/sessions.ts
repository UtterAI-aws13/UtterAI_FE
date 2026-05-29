import { apiClient } from './client'

export type SessionStatus =
  | 'CREATED'
  | 'AUDIO_UPLOADED'
  | 'ANALYSIS_PROCESSING'
  | 'ANALYSIS_COMPLETED'
  | 'REPORT_READY'
  | 'FAILED'

export interface Session {
  id: number
  child: string
  childId: number
  age: string
  date: string
  time: string
  kind: '개별' | '그룹'
  status: SessionStatus
  mlu: number | null
}

export interface SessionDetail extends Session {
  utterances: Utterance[]
  metrics: Metric[]
  soap: SoapNote
}

export interface Utterance {
  t: string
  speaker: 'CHILD' | 'THERAPIST' | 'UNKNOWN'
  text: string
  edited?: boolean
}

export interface Metric {
  label: string
  desc: string
  value: string
  delta: string
  dir: 'up' | 'down'
  good: boolean
}

export interface SoapNote {
  S: string
  O: string
  A: string
  P: string
}

export const sessionsApi = {
  list: (params?: { childId?: number; status?: SessionStatus }) =>
    apiClient.get<Session[]>('/sessions/', { params }),

  get: (id: number) =>
    apiClient.get<SessionDetail>(`/sessions/${id}/`),

  create: (payload: { childId: number; kind: string; date: string; time: string }) =>
    apiClient.post<Session>('/sessions/', payload),

  uploadAudio: (id: number, file: File) => {
    const form = new FormData()
    form.append('audio', file)
    return apiClient.post<Session>(`/sessions/${id}/upload/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  startAnalysis: (id: number) =>
    apiClient.post<Session>(`/sessions/${id}/analyze/`),

  updateTranscript: (id: number, utterances: Utterance[]) =>
    apiClient.patch<SessionDetail>(`/sessions/${id}/transcript/`, { utterances }),
}
