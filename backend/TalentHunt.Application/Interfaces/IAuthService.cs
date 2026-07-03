using TalentHunt.Application.Entities;

namespace TalentHunt.Application.Interfaces;

public interface IAuthService
{
    Task<User?> LoginAsync(string login, string password, CancellationToken cancellationToken = default);
}