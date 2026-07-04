using TalentHunt.Application.Enums;

namespace TalentHunt.Application.DTO;

public record CreateVacancyRequest(
    string Title,
    VacancyLevel Level,
    string BusinessUnit,
    string Description,
    List<Guid>? CompetencyIds = null
);
