using TalentHunt.Application.Enums;

namespace TalentHunt.Application.Entities;

public class Application
{
    public Guid Id { get; set; }

    public Guid VacancyId { get; set; }
    public Vacancy Vacancy { get; set; } = null!;

    public Guid CandidateId { get; set; }
    public Candidate Candidate { get; set; } = null!;

    public ApplicationStatus Status { get; set; } = ApplicationStatus.New;
}
