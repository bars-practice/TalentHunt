using TalentHunt.Application.Enums;

namespace TalentHunt.Application.DTO;

public record UpdateUserRequest(
    string? FullName,
    string? Password,
    Role? Role,
    List<string>? Permissions
);
