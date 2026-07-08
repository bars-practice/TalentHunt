using TalentHunt.Application.DTO;
using TalentHunt.Application.Entities;
using TalentHunt.Application.Enums;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.Application.Services;

public class UserService(IUserRepository userRepository, IPasswordHasher passwordHasher) : IUserService
{
    public async Task<IEnumerable<UserResponse>> GetAllAsync()
    {
        var users = await userRepository.GetAllWithPermissionsAsync(includeDeleted: true);
        return users.Select(ToResponse);
    }

    public async Task<UserResponse> CreateAsync(CreateUserRequest request, UserOperationContext caller)
    {
        UserManagementPolicy.ValidateCreate(caller.Role, request.Role);

        var fullName = NormalizeFullName(request.FullName);
        var login = GenerateLogin(fullName);

        if (await userRepository.LoginExistsAsync(login))
            throw new InvalidOperationException($"Пользователь с логином '{login}' уже существует.");

        var permissionNames = ResolvePermissionNames(request.Permissions, request.Role);
        var permissions = await LoadPermissionsAsync(permissionNames);

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = fullName,
            Login = login,
            PasswordHash = passwordHasher.Hash(request.Password),
            Role = request.Role,
            UserPermissions = permissions.Select(p => new UserPermission
            {
                PermissionId = p.Id,
                Permission = p
            }).ToList()
        };

        await userRepository.AddAsync(user);
        await userRepository.SaveAsync();

        return ToResponse(user);
    }

    public async Task<UserResponse> UpdateAsync(Guid id, UpdateUserRequest request, UserOperationContext caller)
    {
        var user = await userRepository.GetByIdWithPermissionsAsync(id, includeDeleted: true)
            ?? throw new KeyNotFoundException("Пользователь не найден.");

        UserManagementPolicy.ValidateUpdate(
            caller.Role,
            caller.UserId,
            user,
            request.Role,
            request.IsDeleted);

        if (request.IsDeleted == false && user.IsDeleted)
            UserManagementPolicy.ValidateRestore(caller.Role, user);

        if (request.Role.HasValue
            && UserManagementPolicy.IsAdministrativeRole(user.Role)
            && !UserManagementPolicy.IsAdministrativeRole(request.Role.Value))
        {
            var remaining = await userRepository.CountActiveAdministratorsAsync(user.Id);
            UserManagementPolicy.ValidateAdministratorsRemain(remaining);
        }

        if (request.IsDeleted == true
            && !user.IsDeleted
            && UserManagementPolicy.IsAdministrativeRole(user.Role))
        {
            var remaining = await userRepository.CountActiveAdministratorsAsync(user.Id);
            UserManagementPolicy.ValidateAdministratorsRemain(remaining);
        }

        if (!string.IsNullOrWhiteSpace(request.FullName) && request.FullName != user.FullName)
        {
            var fullName = NormalizeFullName(request.FullName);
            var newLogin = GenerateLogin(fullName);
            if (await userRepository.LoginExistsAsync(newLogin, id))
                throw new InvalidOperationException($"Пользователь с логином '{newLogin}' уже существует.");

            user.FullName = fullName;
            user.Login = newLogin;
        }

        if (!string.IsNullOrEmpty(request.Password))
            user.PasswordHash = passwordHasher.Hash(request.Password);

        if (request.Role.HasValue)
            user.Role = request.Role.Value;

        if (request.IsDeleted.HasValue)
            user.IsDeleted = request.IsDeleted.Value;

        await userRepository.UpdateAsync(user);

        var permissionNames = request.Permissions
            ?? (request.Role.HasValue ? RolePermissions.GetDefaultPermissions(user.Role) : null);

        List<string> responsePermissions;

        if (permissionNames != null)
        {
            var permissions = await LoadPermissionsAsync(permissionNames);
            await userRepository.ReplacePermissionsAsync(id, permissions.Select(p => p.Id));
            responsePermissions = permissions.Select(p => p.Name).ToList();
        }
        else
        {
            responsePermissions = user.UserPermissions.Select(up => up.Permission.Name).ToList();
        }

        await userRepository.SaveAsync();

        return new UserResponse(user.Id, user.FullName, user.Login, user.Role, responsePermissions, user.IsDeleted);
    }

    public async Task DeleteAsync(Guid id, UserOperationContext caller)
    {
        var user = await userRepository.GetByIdWithPermissionsAsync(id, includeDeleted: true)
            ?? throw new KeyNotFoundException("Пользователь не найден.");

        UserManagementPolicy.ValidateDelete(caller.Role, caller.UserId, user);

        if (user.IsDeleted)
            return;

        if (UserManagementPolicy.IsAdministrativeRole(user.Role))
        {
            var remaining = await userRepository.CountActiveAdministratorsAsync(user.Id);
            UserManagementPolicy.ValidateAdministratorsRemain(remaining);
        }

        await userRepository.DeleteAsync(user);
        await userRepository.SaveAsync();
    }

    private static List<string> ResolvePermissionNames(List<string>? requested, Role role)
    {
        var permissionNames = requested ?? RolePermissions.GetDefaultPermissions(role);
        if (permissionNames.Count == 0)
            throw new InvalidOperationException("Пользователю необходимо назначить хотя бы одно право.");

        return permissionNames;
    }

    private async Task<List<Permission>> LoadPermissionsAsync(IEnumerable<string> permissionNames)
    {
        var names = permissionNames.Distinct().ToList();
        var permissions = (await userRepository.GetPermissionsByNamesAsync(names)).ToList();

        if (permissions.Count != names.Count)
            throw new InvalidOperationException("Указаны недопустимые права.");

        return permissions;
    }

    public async Task<IReadOnlyList<UserSearchResultResponse>> SearchByRoleAsync(string role, string? query = null, CancellationToken cancellationToken = default)
    {
        var users = await userRepository.SearchByRoleAsync(role, query, cancellationToken);
        return users.Select(u => new UserSearchResultResponse(u.Id, u.Login, u.FullName)).ToList();
    }

    public async Task<UserResponse> GetByIdAsync(Guid id)
    {
        var user = await userRepository.GetByIdWithPermissionsAsync(id, includeDeleted: true)
            ?? throw new KeyNotFoundException("Пользователь не найден.");

        return ToResponse(user);
    }

    private static string NormalizeFullName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            throw new InvalidOperationException("FullName is required.");

        var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return string.Join(' ', parts);
    }

    private static string GenerateLogin(string fullName)
    {
        var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length < 2)
            throw new InvalidOperationException("FullName must contain at least 2 parts: LastName FirstName.");

        var lastName = parts[0].ToLowerInvariant();
        var firstName = parts[1].ToLowerInvariant();
        return $"{firstName}.{lastName}";
    }

    private static UserResponse ToResponse(User u) => new(
        u.Id,
        u.FullName,
        u.Login,
        u.Role,
        u.UserPermissions.Select(up => up.Permission.Name).ToList(),
        u.IsDeleted
    );
}
