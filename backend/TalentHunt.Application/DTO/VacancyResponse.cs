using TalentHunt.Application.Enums;

namespace TalentHunt.Application.DTO;

public record VacancyResponse(
    Guid Id,
    string Title,
    VacancyLevel Level,
    string BusinessUnit,
    string Description,
    Guid? ApproverId,
    string? ApproverFullName,
    List<CompetencyResponse> Competencies,
    bool IsDeleted,
    int ApplicationsCount
);
