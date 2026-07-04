using TalentHunt.Application.Entities;

namespace TalentHunt.Application.Interfaces;

public interface IUserRepository
{
    Task<IEnumerable<User>> GetAllWithPermissionsAsync();

    Task<User?> GetByIdWithPermissionsAsync(Guid id);

    Task<User?> GetByLoginAsync(string login, CancellationToken cancellationToken = default);

    Task<bool> LoginExistsAsync(string login, Guid? excludeId = null);

    Task AddAsync(User user, CancellationToken cancellationToken = default);

    Task UpdateAsync(User user);

    Task DeleteAsync(User user);

    Task ReplacePermissionsAsync(Guid userId, IEnumerable<Guid> permissionIds);

    Task<IEnumerable<Permission>> GetPermissionsByNamesAsync(IEnumerable<string> names);

    Task SaveAsync(CancellationToken cancellationToken = default);
}
