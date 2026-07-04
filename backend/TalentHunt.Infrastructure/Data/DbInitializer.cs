using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TalentHunt.Application.Entities;
using TalentHunt.Application.Enums;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var provider = scope.ServiceProvider;

        var db = provider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        await SeedPermissionsAsync(db);

        var passwordHasher = provider.GetRequiredService<IPasswordHasher>();
        await SeedAdminAsync(db, passwordHasher);
    }

    private static async Task SeedPermissionsAsync(AppDbContext context)
    {
        if (await context.Permissions.AnyAsync())
            return;

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

    private static async Task SeedAdminAsync(AppDbContext context, IPasswordHasher passwordHasher)
    {
        if (await context.Users.AnyAsync(u => u.Role == Role.Admin))
            return;

        var admin = new User
        {
            Id = Guid.NewGuid(),
            FullName = "System Administrator",
            Login = "admin",
            PasswordHash = passwordHasher.Hash("admin"),
            Role = Role.Admin,
            UserPermissions = new List<UserPermission>()
        };

        context.Users.Add(admin);
        await context.SaveChangesAsync();
    }
}
