namespace TalentHunt.Application.DTO;

public record CreateInterviewRequest(
    Guid ApplicationId,
    DateTime? ScheduledAt = null,
    string? Plan = null
);
