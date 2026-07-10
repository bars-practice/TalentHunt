import { api } from './client.ts'

export interface Application {
  id: string
  vacancyId: string
  vacancyTitle: string
  candidateId: string
  candidateFullName: string
  candidatePhone: string
  candidateCity: string
  candidateEducation: string
  candidateExperience: string
  candidatePlacesOfWork: string[]
  status: string | number
  interviewId?: string
  interviewScheduledAt?: string
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
    api.post<Application>('/Applications', data),
  decide: (id: string, status: number) =>
    api.put<Application>(`/Applications/${id}/decision`, { status }),
  revokeDecision: (id: string) =>
    api.put<Application>(`/Applications/${id}/revoke-decision`),

  downloadInvitation: (id: string) =>
    api.download(`/Applications/${id}/invitation`, `invitation-${id}.pdf`),

  downloadRejection: (id: string) =>
    api.download(`/Applications/${id}/rejection`, `rejection-${id}.pdf`),

  downloadProtocol: (id: string) =>
    api.download(`/Applications/${id}/protocol`, `protocol-${id}.pdf`),
}
