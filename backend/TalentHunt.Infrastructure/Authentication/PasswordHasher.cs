using Microsoft.AspNetCore.Identity;
using TalentHunt.Application.Entities;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.Infrastructure.Authentication;

public class UserPasswordHasher : IPasswordHasher
{
    private readonly PasswordHasher<User> _hasher = new();

    public string Hash(string password)
    {
        var user = new User();
        return _hasher.HashPassword(user, password);
    }

    public bool Verify(string password, string hash)
    {
        var user = new User();
        return _hasher.VerifyHashedPassword(user, hash, password) == PasswordVerificationResult.Success;
    }
}