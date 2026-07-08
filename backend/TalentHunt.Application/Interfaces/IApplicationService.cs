using TalentHunt.Application.DTO;
using TalentHunt.Application.Enums;

namespace TalentHunt.Application.Interfaces;

public interface IApplicationService
{
    Task<IEnumerable<ApplicationResponse>> GetAllAsync(
        Guid? approverUserId = null,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task<ApplicationResponse> GetByIdAsync(
        Guid id,
        Guid? approverUserId = null,
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

    Task<ApplicationResponse> DecideAsync(
        Guid id,
        ApplicationDecisionRequest request,
        Guid decidedByUserId,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);
}
