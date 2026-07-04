using TalentHunt.Application.DTO;

namespace TalentHunt.Application.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserResponse>> GetAllAsync();
    Task<UserResponse> CreateAsync(CreateUserRequest request);
    Task<UserResponse> UpdateAsync(Guid id, UpdateUserRequest request);
    Task DeleteAsync(Guid id);
}
