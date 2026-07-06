namespace TalentHunt.Application.DTO;

public record CreateAuditLogRequest(
    string User,
    string IpAddress,
    string Action
);