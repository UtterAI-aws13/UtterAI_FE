import { apiClient } from './client'
import type { User } from '@/store/authStore'

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload {
  name: string
  email: string
  password: string
  role: 'THERAPIST' | 'ADMIN'
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<TokenResponse>('/auth/login', payload),

  signup: (payload: SignupPayload) =>
    apiClient.post<TokenResponse>('/auth/signup', payload),

  refreshToken: (refresh_token: string) =>
    apiClient.post<TokenResponse>('/auth/refresh', { refresh_token }),

  me: () =>
    apiClient.get<User>('/auth/me'),

  logout: () =>
    apiClient.post('/auth/logout'),
}
