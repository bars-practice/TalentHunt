using TalentHunt.Application.Enums;

namespace TalentHunt.Application.DTO;

public record UpdateVacancyRequest(
    string? Title,
    VacancyLevel? Level,
    string? BusinessUnit,
    string? Description,
    List<Guid>? CompetencyIds
);
