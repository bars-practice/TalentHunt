using TalentHunt.Application.Enums;

namespace TalentHunt.Application.DTO;

public record UpdateApplicationRequest(
    ApplicationStatus? Status = null,
    bool? IsDeleted = null
);
