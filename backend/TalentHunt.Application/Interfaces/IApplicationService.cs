using TalentHunt.Application.DTO;

namespace TalentHunt.Application.Interfaces;

public interface IApplicationService
{
    Task<IEnumerable<ApplicationResponse>> GetAllAsync(
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task<ApplicationResponse> GetByIdAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task<ApplicationResponse> CreateAsync(
        CreateApplicationRequest request,
        CancellationToken cancellationToken = default);

    Task<ApplicationResponse> UpdateAsync(
        Guid id,
        UpdateApplicationRequest request,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);
}
