namespace TalentHunt.Application.Entities;

public class Candidate : ISoftDeletable
{
    public Guid Id { get; set; }

    public bool IsDeleted { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string Skills { get; set; } = string.Empty;

    public string Education { get; set; } = string.Empty;

    public string Experience { get; set; } = string.Empty;

    public List<string> PlacesOfWork { get; set; } = [];

    public List<Application> Applications { get; set; } = [];
}
