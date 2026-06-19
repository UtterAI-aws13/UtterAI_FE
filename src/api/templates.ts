import { apiClient } from './client'

export type TemplateType = 'SOAP_NOTE' | 'CUSTOM'
export type TemplateStatus = 'PENDING_UPLOAD' | 'ACTIVE' | 'DELETED'

export interface Template {
  id: string
  owner_id: string | null
  name: string
  description: string | null
  template_type: TemplateType
  sections_json: Record<string, unknown> | null
  file_s3_key: string | null
  file_original_name: string | null
  is_system: boolean
  use_count: number
  status: TemplateStatus
  created_at: string
  updated_at: string
}

export interface TemplatePresignedUploadResponse {
  template_id: string
  upload_url: string
  object_key: string
  expires_in: number
}

const EXTENSION_CONTENT_TYPE: Record<string, string> = {
  '.pdf':  'application/pdf',
  '.doc':  'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls':  'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt':  'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.hwp':  'application/x-hwp',
  '.hwpx': 'application/x-hwpx',
  '.txt':  'text/plain',
  '.rtf':  'application/rtf',
  '.csv':  'text/csv',
  '.odt':  'application/vnd.oasis.opendocument.text',
  '.ods':  'application/vnd.oasis.opendocument.spreadsheet',
  '.odp':  'application/vnd.oasis.opendocument.presentation',
}

export function resolveContentType(file: File): string {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  return EXTENSION_CONTENT_TYPE[ext] ?? (file.type || 'application/octet-stream')
}

export const templatesApi = {
  list:   () => apiClient.get<Template[]>('/templates'),
  get:    (id: string) => apiClient.get<Template>(`/templates/${id}`),
  create: (payload: { name: string; template_type?: TemplateType; description?: string; sections_json?: Record<string, unknown> }) =>
    apiClient.post<Template>('/templates', payload),
  presignedUrl: (payload: { file_name: string; content_type: string; name?: string; template_type?: TemplateType }) =>
    apiClient.post<TemplatePresignedUploadResponse>('/templates/presigned-url', payload),
  confirm: (id: string, payload?: { actual_size_bytes?: number }) =>
    apiClient.post<Template>(`/templates/${id}/confirm`, payload ?? {}),
  update: (id: string, payload: { name?: string; description?: string; sections_json?: Record<string, unknown> }) =>
    apiClient.patch<Template>(`/templates/${id}`, payload),
  delete: (id: string) => apiClient.delete(`/templates/${id}`),
  getFileUrl: (id: string) => apiClient.get<{ url: string }>(`/templates/${id}/file`),
}
