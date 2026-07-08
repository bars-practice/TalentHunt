import { api } from './client.ts'

export interface Application {
  id: string
  vacancyId: string
  vacancyTitle: string
  candidateId: string
  candidateFullName: string
  status: string
  interviewId?: string
  decidedByUserId?: string
  decidedByFullName?: string
  decidedAt?: string
  isDeleted: boolean
}

export interface CreateApplicationRequest {
  vacancyId: string
  candidateId: string
}

export const applicationsService = {
  getAll: () =>
    api.get<Application[]>('/Applications'),
  getById: (id: string) =>
    api.get<Application>(`/Applications/${id}`),
  create: (data: CreateApplicationRequest) =>
    api.post<Application>('/Applications', data)
}
