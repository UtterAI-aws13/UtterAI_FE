import { apiClient } from './client'

export interface Patient {
  id: string
  name: string
  birth_date: string | null
  gender: string | null
  memo: string | null
  created_by_slp_id: string
  current_slp_id: string
  created_at: string
}

export interface CreatePatientPayload {
  name: string
  birth_date?: string
  gender?: string
  memo?: string
  slp_id?: string
}

export const patientsApi = {
  list:   ()                                              => apiClient.get<Patient[]>('/patients'),
  get:    (id: string)                                    => apiClient.get<Patient>(`/patients/${id}`),
  create: (payload: CreatePatientPayload)                 => apiClient.post<Patient>('/patients', payload),
  update: (id: string, payload: Partial<Omit<CreatePatientPayload, 'slp_id'>>) =>
    apiClient.patch<Patient>(`/patients/${id}`, payload),
  delete: (id: string)                                    => apiClient.delete(`/patients/${id}`),
}
