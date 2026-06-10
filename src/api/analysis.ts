import { apiClient } from './client'

export type AnalysisJobStatus =
  | 'PENDING'
  | 'DOWNLOADING'
  | 'PREPROCESSING'
  | 'RUNNING_VAD'
  | 'RUNNING_DIARIZATION'
  | 'RUNNING_ASR'
  | 'ALIGNING'
  | 'CALCULATING_METRICS'
  | 'RUNNING_RAG'
  | 'GENERATING_REPORT'
  | 'SAVING_RESULT'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRYING'
  | 'CANCELLED'

export interface AnalysisJob {
  id: string
  session_id: string
  audio_file_id: string
  status: AnalysisJobStatus
  pipeline_stage: string | null
  error_code: string | null
  error_message: string | null
  retry_count: number
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export const analysisApi = {
  create: (payload: { session_id: string; audio_file_id: string; template_id?: string }) =>
    apiClient.post<AnalysisJob>('/analysis-jobs', payload),

  list: (params?: { session_id?: string; status?: AnalysisJobStatus }) =>
    apiClient.get<AnalysisJob[]>('/analysis-jobs', { params }),

  get:    (id: string) => apiClient.get<AnalysisJob>(`/analysis-jobs/${id}`),
  cancel: (id: string) => apiClient.patch<{ job: AnalysisJob; message: string }>(`/analysis-jobs/${id}/cancel`),
}
