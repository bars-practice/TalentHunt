using TalentHunt.Application.DTO;
using TalentHunt.Application.Entities;
using TalentHunt.Application.Enums;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    public UserService(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<IEnumerable<UserResponse>> GetAllAsync()
    {
        var users = await _userRepository.GetAllWithPermissionsAsync();
        return users.Select(ToResponse);
    }

    public async Task<UserResponse> CreateAsync(CreateUserRequest request)
    {
        var login = GenerateLogin(request.FullName);

        if (await _userRepository.LoginExistsAsync(login))
            throw new InvalidOperationException($"Пользователь с логином '{login}' уже существует.");

        var permissionNames = request.Permissions ?? RolePermissions.GetDefaultPermissions(request.Role);
        var permissions = (await _userRepository.GetPermissionsByNamesAsync(permissionNames)).ToList();

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            Login = login,
            PasswordHash = _passwordHasher.Hash(request.Password),
            Role = request.Role,
            UserPermissions = permissions.Select(p => new UserPermission
            {
                PermissionId = p.Id,
                Permission = p
            }).ToList()
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveAsync();

        return ToResponse(user);
    }

    public async Task<UserResponse> UpdateAsync(Guid id, UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdWithPermissionsAsync(id)
            ?? throw new KeyNotFoundException("Пользователь не найден.");

        if (!string.IsNullOrWhiteSpace(request.FullName) && request.FullName != user.FullName)
        {
            var newLogin = GenerateLogin(request.FullName);
            if (await _userRepository.LoginExistsAsync(newLogin, id))
                throw new InvalidOperationException($"Пользователь с логином '{newLogin}' уже существует.");

            user.FullName = request.FullName;
            user.Login = newLogin;
        }

        if (!string.IsNullOrEmpty(request.Password))
            user.PasswordHash = _passwordHasher.Hash(request.Password);

        if (request.Role.HasValue)
            user.Role = request.Role.Value;

        await _userRepository.UpdateAsync(user);

        var permissionNames = request.Permissions
            ?? (request.Role.HasValue ? RolePermissions.GetDefaultPermissions(user.Role) : null);

        List<string> responsePermissions;

        if (permissionNames != null)
        {
            var permissions = (await _userRepository.GetPermissionsByNamesAsync(permissionNames)).ToList();
            await _userRepository.ReplacePermissionsAsync(id, permissions.Select(p => p.Id));
            responsePermissions = permissions.Select(p => p.Name).ToList();
        }
        else
        {
            responsePermissions = user.UserPermissions.Select(up => up.Permission.Name).ToList();
        }

        await _userRepository.SaveAsync();

        return new UserResponse(user.Id, user.FullName, user.Login, user.Role, responsePermissions);
    }

    public async Task DeleteAsync(Guid id)
    {
        var user = await _userRepository.GetByIdWithPermissionsAsync(id)
            ?? throw new KeyNotFoundException("Пользователь не найден.");

        await _userRepository.DeleteAsync(user);
        await _userRepository.SaveAsync();
    }

    private static string GenerateLogin(string fullName)
    {
        var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length < 3)
            throw new InvalidOperationException("FullName must contain exactly 3 parts: Last First Middle.");
        return $"{parts[0].ToLower()}.{parts[1].ToLower()}";
    }

    private static UserResponse ToResponse(User u) => new(
        u.Id,
        u.FullName,
        u.Login,
        u.Role,
        u.UserPermissions.Select(up => up.Permission.Name).ToList()
    );
}
