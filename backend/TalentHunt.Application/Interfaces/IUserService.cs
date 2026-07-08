using TalentHunt.Application.DTO;

namespace TalentHunt.Application.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserResponse>> GetAllAsync();
    Task<UserResponse> CreateAsync(CreateUserRequest request, UserOperationContext caller);
    Task<UserResponse> UpdateAsync(Guid id, UpdateUserRequest request, UserOperationContext caller);
    Task DeleteAsync(Guid id, UserOperationContext caller);
}
