import { api } from './client.ts'
import type { User } from './auth'
import { Role, convertStringRoleToNumber } from './auth'

export interface CreateUserRequest {
  fullName: string
  login: string
  password: string
  role: Role
}

export interface UpdateUserRequest {
  fullName: string
  role: Role
}

export const usersService = {
  getAll: async (): Promise<User[]> => {
    const users = await api.get<User[]>('/Users')
    return users.map(user => ({
      ...user,
      role: typeof user.role === 'string' ? convertStringRoleToNumber(user.role) : user.role
    }))
  },

  create: (data: CreateUserRequest) =>
    api.post<User>('/Users', data),

  update: (id: string, data: UpdateUserRequest) =>
    api.put<User>(`/Users/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`/Users/${id}`),

  restore: (id: string) =>
    api.post<User>(`/Users/${id}/restore`)
}
