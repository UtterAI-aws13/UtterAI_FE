import { apiClient } from './client'

export interface Child {
  id: number
  name: string
  dob: string
  age: string
  gender: 'M' | 'F' | 'U'
  registered: string
  sessions: number
  lastSession: string
  primaryGoal: string
}

export interface CreateChildPayload {
  name: string
  dob: string
  gender: 'M' | 'F' | 'U'
  primaryGoal: string
}

export const childrenApi = {
  list: (params?: { search?: string }) =>
    apiClient.get<Child[]>('/children/', { params }),

  get: (id: number) =>
    apiClient.get<Child>(`/children/${id}/`),

  create: (payload: CreateChildPayload) =>
    apiClient.post<Child>('/children/', payload),

  update: (id: number, payload: Partial<CreateChildPayload>) =>
    apiClient.patch<Child>(`/children/${id}/`, payload),

  delete: (id: number) =>
    apiClient.delete(`/children/${id}/`),
}
