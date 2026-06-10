import { apiClient } from './client'

export type TemplateType = 'SOAP_NOTE' | 'CUSTOM'
export type TemplateStatus = 'ACTIVE' | 'DELETED'

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

export const templatesApi = {
  list:   () => apiClient.get<Template[]>('/templates'),
  get:    (id: string) => apiClient.get<Template>(`/templates/${id}`),
  create: (payload: { name: string; template_type?: TemplateType; description?: string; sections_json?: Record<string, unknown> }) =>
    apiClient.post<Template>('/templates', payload),
  update: (id: string, payload: { name?: string; description?: string; sections_json?: Record<string, unknown> }) =>
    apiClient.patch<Template>(`/templates/${id}`, payload),
  delete: (id: string) => apiClient.delete(`/templates/${id}`),
  getFileUrl: (id: string) => apiClient.get<{ url: string }>(`/templates/${id}/file`),
}
