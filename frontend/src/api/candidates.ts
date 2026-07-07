import { api } from './client.ts'

export interface Candidate {
  id: string
  fullName: string
  phone: string
  city: string
  skills: string
  education: string
  experience: string
  placesOfWork: string[]
}

export interface CreateCandidateRequest {
  fullName: string
  phone: string
  city: string
  skills: string
  education: string
  experience: string
  placesOfWork?: string[]
}

export const candidatesService = {
  create: (data: CreateCandidateRequest) =>
    api.post<Candidate>('/Candidates', data)
}
