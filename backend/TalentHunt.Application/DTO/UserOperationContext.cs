using TalentHunt.Application.Enums;

namespace TalentHunt.Application.DTO;

public record UserOperationContext(Guid UserId, Role Role);
