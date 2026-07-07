using TalentHunt.Application.Enums;

namespace TalentHunt.Application.DTO;

public record InterviewListItemResponse(
    Guid Id,
    Guid ApplicationId,
    Guid CandidateId,
    string CandidateFullName,
    Guid VacancyId,
    string VacancyTitle,
    ApplicationStatus ApplicationStatus,
    DateTime? ScheduledAt,
    Guid? InterviewerId,
    string? InterviewerFullName
);
