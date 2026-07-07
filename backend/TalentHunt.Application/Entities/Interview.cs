namespace TalentHunt.Application.Entities;

public class Interview : ISoftDeletable
{
    public Guid Id { get; set; }

    public bool IsDeleted { get; set; }

    public Guid ApplicationId { get; set; }
    public Application Application { get; set; } = null!;

    public DateTime? ScheduledAt { get; set; }

    public string Plan { get; set; } = string.Empty;

    public Guid? InterviewerId { get; set; }
    public User? Interviewer { get; set; }

    public List<SkillMatrixEntry> SkillMatrix { get; set; } = [];

    public string GeneralConclusion { get; set; } = string.Empty;
}
