using TalentHunt.Application.Enums;

namespace TalentHunt.Application.Entities;

public class Vacancy : ISoftDeletable
{
    public Guid Id { get; set; }

    public bool IsDeleted { get; set; }

    public string Title { get; set; } = string.Empty;

    public VacancyLevel Level { get; set; }

    public string BusinessUnit { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public Guid? ApproverId { get; set; }

    public User? Approver { get; set; }

    public ICollection<VacancyCompetency> VacancyCompetencies { get; set; } = new List<VacancyCompetency>();
}
