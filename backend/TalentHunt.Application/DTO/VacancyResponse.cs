using TalentHunt.Application.Enums;

namespace TalentHunt.Application.DTO;

public record VacancyResponse(
    Guid Id,
    string Title,
    VacancyLevel Level,
    string BusinessUnit,
    string Description,
    List<CompetencyResponse> Competencies
);
