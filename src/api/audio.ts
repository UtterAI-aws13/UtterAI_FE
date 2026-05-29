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
  status: 'PENDING' | 'UPLOADED' | 'DELETED'
  created_at: string
  updated_at: string
}

export const audioApi = {
  getPresignedUrl: (payload: {
    session_id: string
    file_name: string
    content_type: string
    file_size?: number
  }) =>
    apiClient.post<PresignedUploadResponse>('/audio-files/presigned-url', payload),

  // S3에 직접 PUT (presigned URL 사용, BE 인증 불필요)
  uploadToS3: (uploadUrl: string, file: File) =>
    axios.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type },
    }),

  completeUpload: (payload: {
    session_id: string
    s3_key: string
    duration_seconds?: number
  }) =>
    apiClient.post<AudioFile>('/audio-files', payload),

  get: (id: string) =>
    apiClient.get<AudioFile>(`/audio-files/${id}`),

  delete: (id: string) =>
    apiClient.delete<AudioFile>(`/audio-files/${id}`),
}

// presigned URL 업로드 3단계를 하나의 함수로 묶은 헬퍼
export async function uploadSessionAudio(sessionId: string, file: File): Promise<AudioFile> {
  const { data: presigned } = await audioApi.getPresignedUrl({
    session_id: sessionId,
    file_name: file.name,
    content_type: file.type,
    file_size: file.size,
  })

  await audioApi.uploadToS3(presigned.upload_url, file)

  const { data: audioFile } = await audioApi.completeUpload({
    session_id: sessionId,
    s3_key: presigned.s3_key,
  })

  return audioFile
}
