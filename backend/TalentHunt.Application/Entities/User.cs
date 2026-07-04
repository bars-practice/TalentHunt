using TalentHunt.Application.Enums;

namespace TalentHunt.Application.Entities;

public class User : ISoftDeletable
{
    public Guid Id { get; set; }

    public bool IsDeleted { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Login { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public Role Role { get; set; }

    public ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();
}
