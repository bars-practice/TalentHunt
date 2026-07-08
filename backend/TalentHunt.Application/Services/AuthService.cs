using TalentHunt.Application.Entities;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.Application.Services;

public class AuthService(IUserRepository userRepository, IPasswordHasher passwordHasher) : IAuthService
{
    public async Task<User?> LoginAsync(string login, string password, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByLoginWithPermissionsAsync(login, cancellationToken);
        if (user is null)
            return null;

        if (!passwordHasher.Verify(password, user.PasswordHash))
            return null;

        return user;
    }
}
