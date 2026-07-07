namespace TalentHunt.Application.Entities;

public class SkillMatrixEntry
{
    public Guid CompetencyId { get; set; }

    public int? Score { get; set; }

    public string Comment { get; set; } = string.Empty;
}
