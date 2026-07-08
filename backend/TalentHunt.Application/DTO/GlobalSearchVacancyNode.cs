using TalentHunt.Application.Enums;

namespace TalentHunt.Application.DTO;

public record GlobalSearchVacancyNode(
    Guid VacancyId,
    string VacancyTitle,
    string BusinessUnit,
    bool IsDeleted,
    VacancyLevel Level,
    IReadOnlyList<GlobalSearchApplicationItem> Applications
);
