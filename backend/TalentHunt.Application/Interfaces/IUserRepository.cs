using TalentHunt.Application.Entities;

namespace TalentHunt.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByLoginAsync(string login, CancellationToken cancellationToken = default);

    Task AddAsync(User user, CancellationToken cancellationToken = default);

    Task SaveAsync(CancellationToken cancellationToken = default);
}