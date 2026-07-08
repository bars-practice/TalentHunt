using TalentHunt.Application.Enums;

namespace TalentHunt.Application.DTO;

public record ApplicationResponse(
    Guid Id,
    Guid VacancyId,
    string VacancyTitle,
    Guid CandidateId,
    string CandidateFullName,
    string CandidatePhone,
    string CandidateCity,
    string CandidateEducation,
    string CandidateExperience,
    List<string> CandidatePlacesOfWork,
    ApplicationStatus Status,
    Guid? InterviewId,
    Guid? DecidedByUserId,
    Guid? ApproverId,
    string? ApproverFullName,
    string? DecidedByFullName,
    DateTime? DecidedAt,
    bool IsDeleted
);
