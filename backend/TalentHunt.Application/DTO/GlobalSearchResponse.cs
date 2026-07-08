namespace TalentHunt.Application.DTO;

public record GlobalSearchResponse(
    IReadOnlyList<GlobalSearchVacancyNode> Items,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages,
    bool HasNextPage
);
