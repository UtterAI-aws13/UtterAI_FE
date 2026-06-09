import { apiClient } from './client'

export interface Child {
  id: string
  therapist_id: string
  name: string
  birth_date: string | null
  gender: string | null
  memo: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface CreateChildPayload {
  name: string
  birth_date?: string
  gender?: string
  memo?: string
}

export const childrenApi = {
  list:   (params?: { search?: string })           => apiClient.get<Child[]>('/children', { params }),
  get:    (id: string)                              => apiClient.get<Child>(`/children/${id}`),
  create: (payload: CreateChildPayload)             => apiClient.post<Child>('/children', payload),
  update: (id: string, payload: Partial<CreateChildPayload>) =>
    apiClient.patch<Child>(`/children/${id}`, payload),
  delete: (id: string)                              => apiClient.delete(`/children/${id}`),
}
