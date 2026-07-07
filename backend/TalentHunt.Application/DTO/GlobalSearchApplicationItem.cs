using TalentHunt.Application.Enums;

namespace TalentHunt.Application.DTO;

public record GlobalSearchApplicationItem(
    Guid ApplicationId,
    Guid CandidateId,
    string CandidateFullName,
    string City,
    ApplicationStatus Status
);
