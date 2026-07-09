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
        await SyncMissingPermissionsAsync(db);
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

    private static async Task SyncMissingPermissionsAsync(AppDbContext context)
    {
        var existingNames = await context.Permissions
            .Select(p => p.Name)
            .ToListAsync();

        var missingNames = PermissionType.All
            .Except(existingNames)
            .ToList();

        if (missingNames.Count > 0)
        {
            await context.Permissions.AddRangeAsync(missingNames.Select(name => new Permission
            {
                Id = Guid.NewGuid(),
                Name = name,
                DisplayName = PermissionType.DisplayNames[name]
            }));
            await context.SaveChangesAsync();
        }

        var adminUserIds = await context.Users
            .Where(u => u.Role == Role.Admin || u.Role == Role.SuperAdmin)
            .Select(u => u.Id)
            .ToListAsync();

        if (adminUserIds.Count == 0)
            return;

        var allPermissions = await context.Permissions.ToListAsync();

        var existingAssignments = await context.UserPermissions
            .Where(up => adminUserIds.Contains(up.UserId))
            .Select(up => new { up.UserId, up.PermissionId })
            .ToListAsync();

        var toAdd = new List<UserPermission>();
        foreach (var userId in adminUserIds)
        {
            foreach (var permission in allPermissions)
            {
                if (existingAssignments.Any(a => a.UserId == userId && a.PermissionId == permission.Id))
                    continue;

                toAdd.Add(new UserPermission
                {
                    UserId = userId,
                    PermissionId = permission.Id
                });
            }
        }

        if (toAdd.Count == 0)
            return;

        await context.UserPermissions.AddRangeAsync(toAdd);
        await context.SaveChangesAsync();
    }
}
