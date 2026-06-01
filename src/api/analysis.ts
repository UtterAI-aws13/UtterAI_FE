import { apiClient } from './client'

export type AnalysisJobStatus =
  | 'REQUESTED'
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'

export interface AnalysisJob {
  id: string
  session_id: string
  audio_id: string
  external_ai_job_id: string | null
  status: AnalysisJobStatus
  progress: number
  current_stage: string | null
  error_code: string | null
  error_message: string | null
  requested_at: string
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export const analysisApi = {
  create: (payload: {
    session_id: string
    audio_file_id: string
    template_id?: string | null
  }) =>
    apiClient.post<AnalysisJob>('/analysis-jobs', payload),

  list: (params?: { session_id?: string; status?: AnalysisJobStatus }) =>
    apiClient.get<AnalysisJob[]>('/analysis-jobs', { params }),

  get: (id: string) =>
    apiClient.get<AnalysisJob>(`/analysis-jobs/${id}`),

  cancel: (id: string) =>
    apiClient.patch<{ job: AnalysisJob; message: string }>(`/analysis-jobs/${id}/cancel`),
}
