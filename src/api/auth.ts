import { apiClient } from './client'

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload {
  name: string
  email: string
  password: string
  role: 'therapist' | 'admin'
}

export interface TokenResponse {
  access: string
  refresh: string
  user: {
    id: number
    name: string
    email: string
    role: string
    org: string
  }
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<TokenResponse>('/auth/token/', payload),

  signup: (payload: SignupPayload) =>
    apiClient.post<TokenResponse>('/auth/register/', payload),

  refreshToken: (refresh: string) =>
    apiClient.post<{ access: string }>('/auth/token/refresh/', { refresh }),

  me: () =>
    apiClient.get<TokenResponse['user']>('/auth/me/'),
}
