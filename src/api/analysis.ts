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

export interface AnalysisResult {
  id: string
  result_id?: string  // 일부 엔드포인트는 id 대신 result_id로 반환
  job_id: string
  session_id: string
  summary_json: Record<string, unknown> | null
  metrics_json: Record<string, unknown> | null
  interpretation_text: string | null
  transcript_s3_key: string | null
  metrics_s3_key: string | null
  raw_result_s3_key: string | null
  report_s3_key: string | null
  created_at: string
  updated_at: string
}

export interface AnalysisMetrics {
  result_id: string
  session_id: string
  metrics: Record<string, unknown> | null
}

export const analysisApi = {
  create: (payload: { session_id: string; audio_file_id: string; template_id?: string }) =>
    apiClient.post<AnalysisJob>('/analysis-jobs', payload),

  list: (params?: { session_id?: string; status?: AnalysisJobStatus }) =>
    apiClient.get<AnalysisJob[]>('/analysis-jobs', { params }),

  get:    (id: string) => apiClient.get<AnalysisJob>(`/analysis-jobs/${id}`),
  cancel: (id: string) => apiClient.patch<{ job: AnalysisJob; message: string }>(`/analysis-jobs/${id}/cancel`),

  getResultsBySession: (sessionId: string) =>
    apiClient.get<AnalysisResult[]>(`/sessions/${sessionId}/analysis-results`),

  getMetrics: (resultId: string) =>
    apiClient.get<AnalysisMetrics>(`/analysis-results/${resultId}/metrics`),
}
