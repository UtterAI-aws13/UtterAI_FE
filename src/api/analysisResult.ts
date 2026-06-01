import { apiClient } from './client'

export type SpeakerRole = 'CHILD' | 'THERAPIST' | 'UNKNOWN'

export interface TranscriptSegment {
  id: string
  session_id: string
  speaker_id: string | null
  speaker_label: string | null
  speaker_role: SpeakerRole | null
  start_time: number | null
  end_time: number | null
  original_text: string | null
  edited_text: string | null
  final_text: string | null
  confidence: number | null
  is_confirmed: boolean
  created_at: string
  updated_at: string
}

export interface AnalysisResult {
  id: string
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

export interface AnalysisResultTranscript {
  result_id: string
  session_id: string
  segments: TranscriptSegment[]
}

export interface AnalysisResultSpeaker {
  speaker_id: string
  session_id: string
  speaker_label: string
  speaker_role: SpeakerRole
  utterance_count: number
}

export interface AnalysisResultSpeakerList {
  result_id: string
  session_id: string
  speakers: AnalysisResultSpeaker[]
}

export const analysisResultApi = {
  get: (resultId: string) =>
    apiClient.get<AnalysisResult>(`/analysis-results/${resultId}`),

  getMetrics: (resultId: string) =>
    apiClient.get<AnalysisMetrics>(`/analysis-results/${resultId}/metrics`),

  getTranscript: (resultId: string) =>
    apiClient.get<AnalysisResultTranscript>(`/analysis-results/${resultId}/transcripts`),

  getSpeakers: (resultId: string) =>
    apiClient.get<AnalysisResultSpeakerList>(`/analysis-results/${resultId}/speakers`),
}
