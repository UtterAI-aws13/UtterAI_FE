import { apiClient } from './client'

export interface Template {
  id: string
  therapist_id: string | null
  name: string
  category: string
  content: string | null
  file_original_name: string | null
  is_system: boolean
  use_count: number
  status: string
  created_at: string
  updated_at: string
}

export const templatesApi = {
  list:   (params?: { category?: string }) => apiClient.get<Template[]>('/templates', { params }),
  get:    (id: string)                     => apiClient.get<Template>(`/templates/${id}`),
  create: (payload: { name: string; category: string; content: string }) =>
    apiClient.post<Template>('/templates', payload),
  update: (id: string, payload: { name?: string; category?: string; content?: string }) =>
    apiClient.patch<Template>(`/templates/${id}`, payload),
  delete: (id: string) => apiClient.delete(`/templates/${id}`),
}
