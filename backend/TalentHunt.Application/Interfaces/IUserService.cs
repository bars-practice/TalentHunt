using TalentHunt.Application.DTO;

namespace TalentHunt.Application.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserResponse>> GetAllAsync();
    Task<UserResponse> CreateAsync(CreateUserRequest request, UserOperationContext caller);
    Task<UserResponse> UpdateAsync(Guid id, UpdateUserRequest request, UserOperationContext caller);
    Task<UserResponse> GetByIdAsync(Guid id);
    Task DeleteAsync(Guid id, UserOperationContext caller);
    Task<IReadOnlyList<UserSearchResultResponse>> SearchByRoleAsync(
        string role,
        string? query = null,
        CancellationToken cancellationToken = default);
}
