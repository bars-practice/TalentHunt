using TalentHunt.Application.Enums;

namespace TalentHunt.Application.DTO;

public record InterviewDetailResponse(
    Guid Id,
    Guid ApplicationId,
    ApplicationStatus ApplicationStatus,
    Guid CandidateId,
    string CandidateFullName,
    string CandidatePhone,
    string CandidateCity,
    string CandidateEducation,
    string CandidateExperience,
    List<string> CandidatePlacesOfWork,
    Guid VacancyId,
    string VacancyTitle,
    VacancyLevel VacancyLevel,
    DateTime? ScheduledAt,
    string Plan,
    Guid? InterviewerId,
    string? InterviewerFullName,
    string GeneralConclusion,
    List<SkillMatrixItemResponse> SkillMatrix,
    bool VacancyIsDeleted,
    bool IsDeleted
);

public record SkillMatrixItemResponse(
    Guid CompetencyId,
    string CompetencyName,
    string CompetencyDescription,
    int? Score,
    string Comment
);
