import { api } from './client.ts'

export interface LoginRequest {
  login: string
  password: string
}

export interface LoginResponse {
  message?: string
  user?: {
    id: string
    login: string
    role?: string
  }
}

export const authService = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/Auth/login', data),

  logout: () =>
    api.post<void>('/Auth/logout')
}