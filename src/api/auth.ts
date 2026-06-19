import { apiClient } from './client'

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload {
  name: string
  email: string
  password: string
  role: 'SLP' | 'ADMIN'
}

export interface User {
  id: string
  email: string
  name: string
  role: string
  status: string
  created_at: string
  updated_at: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

export const authApi = {
  login:   (payload: LoginPayload)  => apiClient.post<TokenResponse>('/auth/login', payload),
  signup:  (payload: SignupPayload) => apiClient.post<TokenResponse>('/auth/signup', payload),
  refresh: (refresh_token: string)  => apiClient.post<TokenResponse>('/auth/refresh', { refresh_token }),
  me:      ()                       => apiClient.get<User>('/auth/me'),
  logout:  ()                       => apiClient.post<{ revoked_sessions: number; message: string }>('/auth/logout'),
}
