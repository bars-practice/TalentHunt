namespace TalentHunt.Application.Entities;

public class Competency
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public ICollection<VacancyCompetency> VacancyCompetencies { get; set; } = new List<VacancyCompetency>();
}
