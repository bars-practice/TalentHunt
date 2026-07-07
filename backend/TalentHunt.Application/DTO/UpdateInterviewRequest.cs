namespace TalentHunt.Application.DTO;

public record UpdateInterviewRequest(
    DateTime? ScheduledAt = null,
    string? Plan = null,
    string? GeneralConclusion = null,
    List<SkillMatrixItemRequest>? SkillMatrix = null,
    bool IsDraft = true
);

public record SkillMatrixItemRequest(
    Guid CompetencyId,
    int? Score,
    string? Comment
);
