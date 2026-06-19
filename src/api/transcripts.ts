import { apiClient } from './client'

export type SpeakerRole = 'PATIENT' | 'SLP' | 'GUARDIAN' | 'UNKNOWN'
export type TranscriptStatus = 'DRAFT' | 'EDITING' | 'REVIEWED' | 'FINALIZED'

export interface Transcript {
  id: string
  session_id: string
  audio_file_id: string
  job_id: string
  status: TranscriptStatus
  raw_draft_s3_key: string | null
  final_s3_key: string | null
  finalized_by: string | null
  finalized_at: string | null
  created_at: string
  updated_at: string
}

export interface TranscriptSegment {
  id: string
  transcript_id: string
  session_id: string
  segment_index: number
  speaker_label: string | null
  speaker_role: SpeakerRole
  start_ms: number | null
  end_ms: number | null
  original_text: string | null
  text: string | null
  confidence: number | null
  is_edited: boolean
  edited_by: string | null
  edited_at: string | null
  created_at: string
}

export interface UpdateSegmentPayload {
  text?: string | null
  speaker_role?: SpeakerRole | null
}

export interface BulkUpdateSegmentItem {
  segment_id: string
  text?: string | null
  speaker_role?: SpeakerRole | null
}

export interface TranscriptFinalizeResponse {
  transcript_id: string
  status: TranscriptStatus
  message: string
}

export const transcriptsApi = {
  // GET /sessions/{session_id}/transcript
  getBySession: (sessionId: string) =>
    apiClient.get<Transcript>(`/sessions/${sessionId}/transcript`),

  // GET /transcripts/{transcript_id}
  getById: (transcriptId: string) =>
    apiClient.get<Transcript>(`/transcripts/${transcriptId}`),

  // GET /transcripts/{transcript_id}/segments
  listSegments: (transcriptId: string) =>
    apiClient.get<TranscriptSegment[]>(`/transcripts/${transcriptId}/segments`),

  // POST /transcripts/{transcript_id}/finalize
  finalize: (transcriptId: string) =>
    apiClient.post<TranscriptFinalizeResponse>(`/transcripts/${transcriptId}/finalize`),

  // PATCH /transcripts/{transcript_id}/segments/{segment_id}
  updateSegment: (transcriptId: string, segmentId: string, payload: UpdateSegmentPayload) =>
    apiClient.patch<TranscriptSegment>(`/transcripts/${transcriptId}/segments/${segmentId}`, payload),

  // PATCH /transcripts/{transcript_id}/segments (bulk)
  bulkUpdateSegments: (transcriptId: string, segments: BulkUpdateSegmentItem[]) =>
    apiClient.patch<TranscriptSegment[]>(`/transcripts/${transcriptId}/segments`, { segments }),
}
