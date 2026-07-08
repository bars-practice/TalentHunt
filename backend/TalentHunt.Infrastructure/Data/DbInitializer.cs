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
        await SeedSuperAdminAsync(db, passwordHasher);
    }

    private static async Task SeedPermissionsAsync(AppDbContext context)
    {
        if (await context.Permissions.AnyAsync())
            return;

        var permissions = PermissionType.All
            .Select(name => new Permission
            {
                Id = Guid.NewGuid(),
                Name = name,
                DisplayName = PermissionType.DisplayNames[name]
            })
            .ToList();

        await context.Permissions.AddRangeAsync(permissions);
        await context.SaveChangesAsync();
    }

    private static async Task SeedSuperAdminAsync(AppDbContext context, IPasswordHasher passwordHasher)
    {
        if (await context.Users.IgnoreQueryFilters().AnyAsync(u => u.Role == Role.SuperAdmin))
            return;

        var allPermissions = await context.Permissions.ToListAsync();

        var superAdmin = new User
        {
            Id = Guid.NewGuid(),
            FullName = "System Administrator",
            Login = "admin",
            PasswordHash = passwordHasher.Hash("admin"),
            Role = Role.SuperAdmin,
            UserPermissions = allPermissions.Select(p => new UserPermission
            {
                PermissionId = p.Id,
                Permission = p
            }).ToList()
        };

        context.Users.Add(superAdmin);
        await context.SaveChangesAsync();
    }
}
