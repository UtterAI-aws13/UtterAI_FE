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

export interface Transcript {
  session_id: string
  result_id: string | null
  segments: TranscriptSegment[]
}

export const transcriptApi = {
  getBySession: (sessionId: string) =>
    apiClient.get<Transcript>(`/sessions/${sessionId}/transcript`),

  updateSegment: (
    resultId: string,
    segmentId: string,
    payload: { text?: string; speaker_role?: SpeakerRole; edit_reason?: string },
  ) => apiClient.patch<TranscriptSegment>(`/transcripts/${resultId}/segments/${segmentId}`, payload),

  bulkUpdate: (
    resultId: string,
    segments: Array<{ segment_id: string; text?: string; speaker_role?: SpeakerRole; edit_reason?: string }>,
  ) => apiClient.patch<TranscriptSegment[]>(`/transcripts/${resultId}/segments`, { segments }),

  confirm: (resultId: string) =>
    apiClient.patch<{ session_id: string; confirmed_segments: number; message: string }>(
      `/transcripts/${resultId}/confirm`,
    ),
}
