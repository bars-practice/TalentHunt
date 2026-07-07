import { api } from './client.ts'

export interface Competency {
  id: string
  name: string
  description: string
}

export interface CreateCompetencyRequest {
  name: string
  description: string
}

export interface UpdateCompetencyRequest {
  name?: string
  description?: string
}

export const competenciesService = {
  getAll: async (): Promise<Competency[]> => {
    return api.get<Competency[]>('/Competencies')
  },

  create: (data: CreateCompetencyRequest) =>
    api.post<Competency>('/Competencies', data),

  update: (id: string, data: UpdateCompetencyRequest) =>
    api.put<Competency>(`/Competencies/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`/Competencies/${id}`)
}
