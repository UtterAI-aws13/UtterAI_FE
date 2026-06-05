import { apiClient } from './client'
import type { TranscriptSegment, SpeakerRole } from './analysisResult'

export interface Transcript {
  session_id: string
  result_id: string | null
  segments: TranscriptSegment[]
}

export interface TranscriptConfirmResponse {
  session_id: string
  confirmed_segments: number
  message: string
}

export interface UpdateSegmentPayload {
  text?: string | null
  speaker_role?: SpeakerRole | null
  edit_reason?: string | null
}

export interface CreateSegmentPayload {
  speaker_label?: string | null
  speaker_role?: SpeakerRole | null
  start_time?: number | null
  end_time?: number | null
  text?: string | null
  edit_reason?: string | null
}

export interface BulkUpdateSegmentItem {
  segment_id: string
  text?: string | null
  speaker_role?: SpeakerRole | null
  edit_reason?: string | null
}

export const transcriptsApi = {
  // GET /sessions/{session_id}/transcript
  getBySession: (sessionId: string) =>
    apiClient.get<Transcript>(`/sessions/${sessionId}/transcript`),

  // GET /transcripts/{result_id}
  getByResult: (resultId: string) =>
    apiClient.get<Transcript>(`/transcripts/${resultId}`),

  // PATCH /transcripts/{result_id}/confirm
  confirm: (resultId: string) =>
    apiClient.patch<TranscriptConfirmResponse>(`/transcripts/${resultId}/confirm`),

  // POST /transcripts/{result_id}/segments
  addSegment: (resultId: string, payload: CreateSegmentPayload) =>
    apiClient.post<TranscriptSegment>(`/transcripts/${resultId}/segments`, payload),

  // PATCH /transcripts/{result_id}/segments/{segment_id}
  updateSegment: (resultId: string, segmentId: string, payload: UpdateSegmentPayload) =>
    apiClient.patch<TranscriptSegment>(`/transcripts/${resultId}/segments/${segmentId}`, payload),

  // PATCH /transcripts/{result_id}/segments (bulk)
  bulkUpdateSegments: (resultId: string, segments: BulkUpdateSegmentItem[]) =>
    apiClient.patch<Transcript>(`/transcripts/${resultId}/segments`, { segments }),

  // DELETE /transcripts/{result_id}/segments/{segment_id}
  deleteSegment: (resultId: string, segmentId: string) =>
    apiClient.delete<Transcript>(`/transcripts/${resultId}/segments/${segmentId}`),
}
