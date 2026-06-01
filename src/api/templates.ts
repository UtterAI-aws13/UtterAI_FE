import { apiClient } from './client'

export type TemplateCategory = 'SESSION' | 'ASSESSMENT' | 'REPORT'
export type TemplateStatus = 'ACTIVE' | 'DELETED'

export interface Template {
  id: string
  therapist_id: string | null
  name: string
  category: TemplateCategory
  content: string | null
  file_original_name: string | null
  is_system: boolean
  use_count: number
  status: TemplateStatus
  created_at: string
  updated_at: string
}

export interface CreateTemplatePayload {
  name: string
  category: TemplateCategory
  content: string
}

export interface UpdateTemplatePayload {
  name?: string
  category?: TemplateCategory
  content?: string
}

export const templatesApi = {
  list: () =>
    apiClient.get<Template[]>('/templates'),

  get: (id: string) =>
    apiClient.get<Template>(`/templates/${id}`),

  create: (payload: CreateTemplatePayload) =>
    apiClient.post<Template>('/templates', payload),

  uploadFile: (file: File, name: string, category: TemplateCategory) => {
    const form = new FormData()
    form.append('file', file)
    if (name.trim()) form.append('name', name.trim())
    form.append('category', category)
    return apiClient.post<Template>('/templates/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getFileUrl: (id: string) =>
    apiClient.get<{ url: string }>(`/templates/${id}/file`),

  update: (id: string, payload: UpdateTemplatePayload) =>
    apiClient.patch<Template>(`/templates/${id}`, payload),

  delete: (id: string) =>
    apiClient.delete<Template>(`/templates/${id}`),
}
