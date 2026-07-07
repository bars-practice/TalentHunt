import { api } from './client.ts'

export const Role = {
  Admin: 0,
  HR: 1,
  Approver: 2
} as const

export type Role = typeof Role[keyof typeof Role]

export const convertStringRoleToNumber = (role: string | number): Role => {
  if (typeof role === 'number') {
    return role as Role;
  }

  const roleMap: Record<string, Role> = {
    'Admin': Role.Admin,
    'HR': Role.HR,
    'Approver': Role.Approver,
    '0': Role.Admin,
    '1': Role.HR,
    '2': Role.Approver,
  };

  return roleMap[role] ?? Role.Approver;
};

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

  me: async () => {
    const userData = await api.get<User>('/Auth/me');
    if (userData && typeof userData.role === 'string') {
      userData.role = convertStringRoleToNumber(userData.role);
    }
    return userData;
  },

  logout: () =>
    api.post<void>('/Auth/logout')
}