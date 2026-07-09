// src/api/candidates.ts
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
  isDeleted?: boolean
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

// Интерфейсы для поискового ответа
export interface SearchApplicationItem {
  applicationId: string;
  candidateId: string; // ID кандидата для создания нового отклика
  candidateFullName: string;
  city: string;
  status: string;
}

export interface SearchVacancyGroup {
  vacancyId: string;
  vacancyTitle: string;
  businessUnit: string;
  applications: SearchApplicationItem[];
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface CandidateSearchResult {
  id: string
  fullName: string
  city: string
  isDeleted: boolean
}

export const candidatesService = {
  getById: (id: string) =>
    api.get<Candidate>(`/Candidates/${id}`),

  create: (data: CreateCandidateRequest) =>
    api.post<Candidate>('/Candidates', data),

  getAll: (excludeVacancyId?: string) =>
    api.get<Candidate[]>(
      excludeVacancyId ? `/Candidates?excludeVacancyId=${excludeVacancyId}` : '/Candidates'
    ),

  search: (query: string, excludeVacancyId?: string) =>
    api.get<CandidateSearchResult[]>(
      excludeVacancyId
        ? `/Candidates/search?query=${encodeURIComponent(query)}&excludeVacancyId=${excludeVacancyId}`
        : `/Candidates/search?query=${encodeURIComponent(query)}`
    ),

  block: (id: string) =>
    api.delete(`/Candidates/${id}`),

  restore: (id: string) =>
    api.put<Candidate>(`/Candidates/${id}/restore`, {}),

  downloadCard: (id: string) =>
    api.download(`/Candidates/${id}/card`, `candidate-card-${id}.pdf`),
}