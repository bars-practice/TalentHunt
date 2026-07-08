using TalentHunt.Application.Entities;

namespace TalentHunt.Application.Interfaces;

public interface IUserRepository
{
    Task<IEnumerable<User>> GetAllWithPermissionsAsync(bool includeDeleted = false);

    Task<User?> GetByIdWithPermissionsAsync(Guid id, bool includeDeleted = false);

    Task<User?> GetByLoginAsync(string login, CancellationToken cancellationToken = default);

    Task<User?> GetByLoginWithPermissionsAsync(string login, CancellationToken cancellationToken = default);

    Task<bool> LoginExistsAsync(string login, Guid? excludeId = null);

    Task<int> CountActiveAdministratorsAsync(Guid? excludeUserId = null, CancellationToken cancellationToken = default);

    Task AddAsync(User user, CancellationToken cancellationToken = default);

    Task UpdateAsync(User user);

    Task DeleteAsync(User user);

    Task ReplacePermissionsAsync(Guid userId, IEnumerable<Guid> permissionIds);

    Task<IEnumerable<Permission>> GetPermissionsByNamesAsync(IEnumerable<string> names);

    Task SaveAsync(CancellationToken cancellationToken = default);
}
