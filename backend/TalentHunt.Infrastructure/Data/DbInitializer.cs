using Microsoft.EntityFrameworkCore;
using TalentHunt.Application.Entities;
using TalentHunt.Application.Enums;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedPermissions(AppDbContext context)
    {
        if (await context.Permissions.AnyAsync()) return;

        var permissions = new List<Permission>
        {
            new() { Id = Guid.NewGuid(), Name = PermissionType.CanViewResumes,    DisplayName = "View Resumes"    },
            new() { Id = Guid.NewGuid(), Name = PermissionType.CanEditResumes,    DisplayName = "Edit Resumes"    },
            new() { Id = Guid.NewGuid(), Name = PermissionType.CanApproveResumes, DisplayName = "Approve Resumes" },
            new() { Id = Guid.NewGuid(), Name = PermissionType.CanRejectResumes,  DisplayName = "Reject Resumes"  },
        };

        await context.Permissions.AddRangeAsync(permissions);
        await context.SaveChangesAsync();
    }

    public static async Task SeedAdmin(AppDbContext context, IPasswordHasher passwordHasher)
    {
        if (await context.Users.AnyAsync(u => u.Role == Role.Admin))
            return;

        var admin = new User
        {
            Id = Guid.NewGuid(),
            FullName = "System Administrator",
            Login = "admin",
            PasswordHash = passwordHasher.Hash("admin123"),
            Role = Role.Admin,
            UserPermissions = new List<UserPermission>()
        };

        context.Users.Add(admin);
        await context.SaveChangesAsync();
    }
}
