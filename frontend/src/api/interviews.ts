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
  vacancyIsDeleted: boolean
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

export interface InterviewListItem {
  id: string
  applicationId: string
  candidateId: string
  candidateFullName: string
  vacancyId: string
  vacancyTitle: string
  applicationStatus: ApplicationStatus
  scheduledAt: string | null
  interviewerId: string | null
  interviewerFullName: string | null
}

export interface InterviewListParams {
  candidateId?: string
  vacancyId?: string
  applicationStatus?: ApplicationStatus
}

export const interviewsService = {
  getAll: (params?: InterviewListParams) => {
    const search = new URLSearchParams()
    if (params?.candidateId) search.set('candidateId', params.candidateId)
    if (params?.vacancyId) search.set('vacancyId', params.vacancyId)
    if (params?.applicationStatus !== undefined) {
      search.set('applicationStatus', String(params.applicationStatus))
    }
    const query = search.toString()
    return api.get<InterviewListItem[]>(`/Interviews${query ? `?${query}` : ''}`)
  },

  getById: (id: string) =>
    api.get<InterviewDetail>(`/Interviews/${id}`),

  create: (applicationId: string, scheduledAt?: string | null, plan?: string | null) =>
    api.post<InterviewDetail>('/Interviews', { applicationId, scheduledAt, plan }),

  start: (id: string) =>
    api.post<InterviewDetail>(`/Interviews/${id}/start`),

  update: (id: string, data: UpdateInterviewRequest) =>
    api.put<InterviewDetail>(`/Interviews/${id}`, data),
}
