namespace TalentHunt.Application.DTO;

public record AuditLogResponse(
    Guid Id,
    DateTime Timestamp,
    string User,
    string IpAddress,
    string Action
);