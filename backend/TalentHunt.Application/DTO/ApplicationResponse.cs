using TalentHunt.Application.Enums;

namespace TalentHunt.Application.DTO;

public record ApplicationResponse(
    Guid Id,
    Guid VacancyId,
    string VacancyTitle,
    Guid CandidateId,
    string CandidateFullName,
    ApplicationStatus Status,
    Guid? InterviewId,
    Guid? DecidedByUserId,
    string? DecidedByFullName,
    DateTime? DecidedAt,
    bool IsDeleted
);
