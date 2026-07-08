using Microsoft.EntityFrameworkCore;
using TalentHunt.Application.Entities;
using TalentHunt.Application.Enums;
using TalentHunt.Application.Interfaces;
using TalentHunt.Infrastructure.Data;
using TalentHunt.Infrastructure.Extensions;

namespace TalentHunt.Infrastructure.Repositories;

public class UserRepository(AppDbContext context) : IUserRepository
{
    public async Task<IEnumerable<User>> GetAllWithPermissionsAsync(bool includeDeleted = false) =>
        await context.Users
            .IncludeDeletedIf(includeDeleted)
            .Include(u => u.UserPermissions)
            .ThenInclude(up => up.Permission)
            .AsNoTracking()
            .ToListAsync();

    public async Task<User?> GetByIdWithPermissionsAsync(Guid id, bool includeDeleted = false) =>
        await context.Users
            .IncludeDeletedIf(includeDeleted)
            .Include(u => u.UserPermissions)
            .ThenInclude(up => up.Permission)
            .FirstOrDefaultAsync(u => u.Id == id);

    public Task<User?> GetByLoginAsync(string login, CancellationToken cancellationToken = default) =>
        context.Users.FirstOrDefaultAsync(u => u.Login == login, cancellationToken);

    public Task<User?> GetByLoginWithPermissionsAsync(string login, CancellationToken cancellationToken = default) =>
        context.Users
            .Include(u => u.UserPermissions)
            .ThenInclude(up => up.Permission)
            .FirstOrDefaultAsync(u => u.Login == login, cancellationToken);

    public Task<bool> LoginExistsAsync(string login, Guid? excludeId = null) =>
        excludeId.HasValue
            ? context.Users.IgnoreQueryFilters().AnyAsync(u => u.Login == login && u.Id != excludeId.Value)
            : context.Users.IgnoreQueryFilters().AnyAsync(u => u.Login == login);

    public Task<int> CountActiveAdministratorsAsync(
        Guid? excludeUserId = null,
        CancellationToken cancellationToken = default)
    {
        var query = context.Users
            .Where(u => !u.IsDeleted && (u.Role == Role.Admin || u.Role == Role.SuperAdmin));

        if (excludeUserId.HasValue)
            query = query.Where(u => u.Id != excludeUserId.Value);

        return query.CountAsync(cancellationToken);
    }

    public Task AddAsync(User user, CancellationToken cancellationToken = default) =>
        context.Users.AddAsync(user, cancellationToken).AsTask();

    public Task UpdateAsync(User user)
    {
        context.Users.Update(user);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(User user)
    {
        user.IsDeleted = true;
        context.Users.Update(user);
        return Task.CompletedTask;
    }

    public async Task ReplacePermissionsAsync(Guid userId, IEnumerable<Guid> permissionIds)
    {
        var existing = await context.UserPermissions
            .Where(up => up.UserId == userId)
            .ToListAsync();

        context.UserPermissions.RemoveRange(existing);

        var newPermissions = permissionIds.Select(pid => new UserPermission
        {
            UserId = userId,
            PermissionId = pid
        });

        await context.UserPermissions.AddRangeAsync(newPermissions);
    }

    public async Task<IEnumerable<Permission>> GetPermissionsByNamesAsync(IEnumerable<string> names) =>
        await context.Permissions
            .Where(p => names.Contains(p.Name))
            .ToListAsync();

    public Task SaveAsync(CancellationToken cancellationToken = default) =>
        context.SaveChangesAsync(cancellationToken);
}
