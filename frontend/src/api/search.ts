import { api } from './client.ts'

export interface SearchApplicationItem {
  applicationId: string;
  candidateId: string;
  candidateFullName: string;
  city: string;
  status: number;
}

export interface SearchVacancyItem {
  vacancyId: string;
  vacancyTitle: string;
  businessUnit: string;
  isDeleted: boolean;
  applications: SearchApplicationItem[];
}

export interface SearchResponse {
  items: SearchVacancyItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface SearchFilters {
  types?: ('candidate' | 'vacancy' | 'application' | 'interview')[]
  dateFrom?: string
  dateTo?: string
  status?: string
}

export const searchService = {
  search: (query: string, page = 1, pageSize = 10) =>
    api.get<SearchResponse>(
      `/Search?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`
    ),
}
