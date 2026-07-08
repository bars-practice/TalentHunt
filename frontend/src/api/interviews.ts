import { api } from './client.ts'

export const ApplicationStatus = {
  Applied: 0,
  InProgress: 1,
  PendingDecision: 2,
  Approved: 3,
  Rejected: 4,
} as const

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus]

export interface SkillMatrixItem {
  competencyId: string
  competencyName: string
  competencyDescription: string
  score: number | null
  comment: string
}

export interface InterviewDetail {
  id: string
  applicationId: string
  applicationStatus: number
  candidateId: string
  candidateFullName: string
  candidatePhone: string
  candidateCity: string
  candidateEducation: string
  candidateExperience: string
  candidatePlacesOfWork: string[]
  vacancyId: string
  vacancyTitle: string
  vacancyLevel: number
  scheduledAt: string | null
  plan: string
  interviewerId: string | null
  interviewerFullName: string | null
  generalConclusion: string
  skillMatrix: SkillMatrixItem[]
  isDeleted: boolean
}

export interface SkillMatrixItemRequest {
  competencyId: string
  score: number | null
  comment: string | null
}

export interface UpdateInterviewRequest {
  scheduledAt?: string | null
  plan?: string | null
  generalConclusion?: string | null
  skillMatrix?: SkillMatrixItemRequest[]
  isDraft?: boolean
}

export const interviewsService = {
  getById: (id: string) =>
    api.get<InterviewDetail>(`/Interviews/${id}`),

  create: (applicationId: string, scheduledAt?: string | null, plan?: string | null) =>
    api.post<InterviewDetail>('/Interviews', { applicationId, scheduledAt, plan }),

  start: (id: string) =>
    api.post<InterviewDetail>(`/Interviews/${id}/start`),

  update: (id: string, data: UpdateInterviewRequest) =>
    api.put<InterviewDetail>(`/Interviews/${id}`, data),
}
