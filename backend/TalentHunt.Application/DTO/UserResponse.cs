using TalentHunt.Application.Enums;

namespace TalentHunt.Application.DTO;

public record UserResponse(
    Guid Id,
    string FullName,
    string Login,
    Role Role,
    List<string> Permissions
);
