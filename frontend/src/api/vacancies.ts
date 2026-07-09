import { api } from './client.ts'

export const VacancyLevel = {
  Junior: 0,
  Middle: 1,
  Senior: 2
} as const

export type VacancyLevel = typeof VacancyLevel[keyof typeof VacancyLevel]

export interface Competency {
  id: string
  name: string
  description?: string
}

export interface Vacancy {
  id: string
  title: string
  level: VacancyLevel
  businessUnit: string
  description: string
  approverId: string
  competencies: Competency[]
  isDeleted: boolean
  applicationsCount: number
}

export interface CreateVacancyRequest {
  title: string
  level: VacancyLevel
  businessUnit: string
  description: string
  approverId: string
  competencyIds: string[]
}



export interface UpdateVacancyRequest {
  title?: string
  level?: VacancyLevel
  businessUnit?: string
  description?: string
  approverId?: string
  competencyIds?: string[]
  isDeleted?: boolean
}

export const vacanciesService = {
  getAll: async (): Promise<Vacancy[]> => {
    return api.get<Vacancy[]>('/Vacancies')
  },

  create: (data: CreateVacancyRequest) =>
    api.post<Vacancy>('/Vacancies', data),

  update: (id: string, data: UpdateVacancyRequest) =>
    api.put<Vacancy>(`/Vacancies/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`/Vacancies/${id}`)
}
