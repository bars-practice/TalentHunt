using TalentHunt.Application.Enums;

namespace TalentHunt.Application.DTO;

public record CreateApplicationRequest(
    Guid VacancyId,
    Guid CandidateId,
    ApplicationStatus? Status = null
);
