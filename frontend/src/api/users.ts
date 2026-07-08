import { api } from './client.ts'
import type { User } from './auth'
import { Role, convertStringRoleToNumber } from './auth'

export interface PermissionInfo {
  name: string
  displayName: string
}

export interface CreateUserRequest {
  fullName: string
  password: string
  role: Role
  permissions?: string[]
}

export interface UpdateUserRequest {
  fullName?: string
  password?: string
  role?: Role
  permissions?: string[]
  isDeleted?: boolean
}

export interface UserSearchResult {
  id: string
  login: string
  fullName: string
}

export const usersService = {
  getAll: async (): Promise<User[]> => {
    const users = await api.get<User[]>('/Users')
    return users.map(user => ({
      ...user,
      role: typeof user.role === 'string' ? convertStringRoleToNumber(user.role) : user.role
    }))
  },

  searchByRole: (role: string, query?: string): Promise<UserSearchResult[]> =>
    api.get<UserSearchResult[]>(`/Users/search?role=${role}${query ? `&query=${encodeURIComponent(query)}` : ''}`),

  create: (data: CreateUserRequest) =>
    api.post<User>('/Users', data),

  update: (id: string, data: UpdateUserRequest) =>
    api.put<User>(`/Users/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`/Users/${id}`),

  restore: (id: string) =>
    api.put<User>(`/Users/${id}`, { isDeleted: false }),

  getById: (id: string): Promise<User> =>
    api.get<User>(`/Users/${id}`),

  getPermissions: (): Promise<PermissionInfo[]> =>
    api.get<PermissionInfo[]>('/Users/permissions'),
}
