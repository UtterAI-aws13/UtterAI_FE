import axios from 'axios'
import { apiClient } from './client'

export interface PresignedUploadResponse {
  audio_file_id: string
  upload_url: string
  s3_bucket: string
  s3_key: string
  expires_in: number
}

export interface AudioFile {
  id: string
  session_id: string
  original_file_name: string
  content_type: string | null
  file_size: number | null
  s3_bucket: string
  s3_key: string
  duration_seconds: number | null
  status: string
  created_at: string
  updated_at: string
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

  complete: (payload: { session_id: string; s3_key: string; duration_seconds?: number }) =>
    apiClient.post<AudioFile>('/audio-files', payload),

  get:    (id: string) => apiClient.get<AudioFile>(`/audio-files/${id}`),
  delete: (id: string) => apiClient.delete(`/audio-files/${id}`),
}
