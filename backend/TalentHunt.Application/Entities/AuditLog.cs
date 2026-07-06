namespace TalentHunt.Application.Entities;

public class AuditLog
{
    public Guid Id { get; set; }
    public DateTime Timestamp { get; set; }
    public string User { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
}