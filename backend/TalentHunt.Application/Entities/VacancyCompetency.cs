namespace TalentHunt.Application.Entities;

public class VacancyCompetency
{
    public Guid VacancyId { get; set; }
    public Vacancy Vacancy { get; set; } = null!;

    public Guid CompetencyId { get; set; }
    public Competency Competency { get; set; } = null!;
}
