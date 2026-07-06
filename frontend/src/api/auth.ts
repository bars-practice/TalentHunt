import { api } from './client.ts'

export const Role = {
  Admin: "Admin",
  Recruiter: "Recruiter",
  HrDirector: "HrDirector"
} as const

export type Role = typeof Role[keyof typeof Role]

export interface User {
  id: string
  fullName: string
  login: string
  role: Role
  permissions: string[]
  isDeleted: boolean
}

export interface LoginRequest {
  login: string
  password: string
}

export interface LoginResponse {
  message?: string
  user?: User
}

export const authService = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/Auth/login', data),

  me: () =>
    api.get<User>('/Auth/me'),

  logout: () =>
    api.post<void>('/Auth/logout')
}