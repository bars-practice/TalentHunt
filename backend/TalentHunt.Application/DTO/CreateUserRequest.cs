using TalentHunt.Application.Enums;

namespace TalentHunt.Application.DTO;

public record CreateUserRequest(
    string FullName,
    string Password,
    Role Role,
    List<string>? Permissions = null
);
