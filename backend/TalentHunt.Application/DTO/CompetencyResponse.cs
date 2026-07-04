namespace TalentHunt.Application.DTO;

public record CompetencyResponse(
    Guid Id,
    string Name,
    string Description,
    bool IsDeleted
);
