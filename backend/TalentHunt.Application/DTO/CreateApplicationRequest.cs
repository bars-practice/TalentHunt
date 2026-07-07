namespace TalentHunt.Application.DTO;

public record CreateApplicationRequest(
    Guid VacancyId,
    Guid CandidateId
);
