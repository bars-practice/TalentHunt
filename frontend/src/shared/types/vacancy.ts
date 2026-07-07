export const VACANCY_LEVEL = {
  Junior: "Junior",
  Middle: "Middle",
  Senior: "Senior",
} as const;

export type VacancyLevel = keyof typeof VACANCY_LEVEL;
