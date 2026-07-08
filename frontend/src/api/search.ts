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
  level: number; // 0=Junior, 1=Middle, 2=Senior
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
  vacancyStatus: 'all' | 'active' | 'archived';
  vacancyLevels: number[];      // пустой = все
  candidateStatuses: number[];  // пустой = все
  city: string;
}

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  vacancyStatus: 'all',
  vacancyLevels: [],
  candidateStatuses: [],
  city: '',
};

export const searchService = {
  search: (query: string, filters: SearchFilters = DEFAULT_SEARCH_FILTERS, page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      query: query,
      page: String(page),
      pageSize: String(pageSize),
    });

    if (filters.vacancyStatus !== "all") {
      params.set("vacancyStatus", filters.vacancyStatus);
    }
    filters.vacancyLevels.forEach(l => params.append("levels", String(l)));
    filters.candidateStatuses.forEach(s => params.append("candidateStatuses", String(s)));
    if (filters.city.trim()) {
      params.set("city", filters.city.trim());
    }

    return api.get<SearchResponse>(`/Search?${params.toString()}`);
  },
}
