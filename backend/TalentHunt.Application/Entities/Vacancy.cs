using TalentHunt.Application.Enums;

namespace TalentHunt.Application.Entities;

public class Vacancy
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public VacancyLevel Level { get; set; }

    public string BusinessUnit { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public ICollection<VacancyCompetency> VacancyCompetencies { get; set; } = new List<VacancyCompetency>();
}
