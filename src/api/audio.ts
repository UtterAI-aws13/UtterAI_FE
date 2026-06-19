import axios from 'axios'
import { apiClient } from './client'

export interface PresignedUploadResponse {
  audio_file_id: string
  upload_url: string
  object_key: string
  expires_in: number
}

export type AudioFileStatus = 'PENDING_UPLOAD' | 'UPLOADED' | 'FAILED' | 'EXPIRED' | 'DELETED'

export interface AudioFile {
  id: string
  session_id: string
  created_by_slp_id: string
  object_key: string
  original_filename: string
  content_type: string | null
  actual_size_bytes: number | null
  presigned_expires_at: string | null
  uploaded_at: string | null
  status: AudioFileStatus
  created_at: string
}

export const audioApi = {
  presignedUrl: (payload: {
    file_name: string
    content_type: string
    session_id: string
    file_size?: number
  }) => apiClient.post<PresignedUploadResponse>('/audio-files/presigned-url', payload),

  uploadToS3: (uploadUrl: string, file: File) =>
    axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } }),

  complete: (payload: { session_id: string; object_key: string; actual_size_bytes?: number }) =>
    apiClient.post<AudioFile>('/audio-files', payload),

  get:    (id: string) => apiClient.get<AudioFile>(`/audio-files/${id}`),
  delete: (id: string) => apiClient.delete(`/audio-files/${id}`),
}
