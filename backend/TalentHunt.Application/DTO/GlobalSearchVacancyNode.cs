namespace TalentHunt.Application.DTO;

public record GlobalSearchVacancyNode(
    Guid VacancyId,
    string VacancyTitle,
    string BusinessUnit,
    bool IsDeleted,
    IReadOnlyList<GlobalSearchApplicationItem> Applications
);
