namespace TalentHunt.Application.Entities;

public class Interview
{
    public Guid Id { get; set; }

    public Guid ApplicationId { get; set; }
    public Application Application { get; set; } = null!;
}
