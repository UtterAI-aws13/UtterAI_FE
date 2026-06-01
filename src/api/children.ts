import { apiClient } from './client'

export interface Child {
  id: string
  therapist_id: string
  name: string
  birth_date: string | null
  gender: string | null
  memo: string | null
  status: 'ACTIVE' | 'DELETED'
  created_at: string
  updated_at: string
}

export interface CreateChildPayload {
  name: string
  birth_date?: string | null
  gender?: string | null
  memo?: string | null
  therapist_id?: string | null
}

export interface UpdateChildPayload {
  name?: string
  birth_date?: string | null
  gender?: string | null
  memo?: string | null
}

export const childrenApi = {
  list: (params?: { search?: string }) =>
    apiClient.get<Child[]>('/children', { params }),

  get: (id: string) =>
    apiClient.get<Child>(`/children/${id}`),

  create: (payload: CreateChildPayload) =>
    apiClient.post<Child>('/children', payload),

  update: (id: string, payload: UpdateChildPayload) =>
    apiClient.patch<Child>(`/children/${id}`, payload),

  delete: (id: string) =>
    apiClient.delete<Child>(`/children/${id}`),
}
