using TalentHunt.Application.DTO;

namespace TalentHunt.Application.Interfaces;

public interface IVacancyService
{
    Task<IEnumerable<VacancyResponse>> GetAllAsync(
        Guid? approverUserId = null,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task<VacancyResponse> CreateAsync(CreateVacancyRequest request, CancellationToken cancellationToken = default);

    Task<VacancyResponse> UpdateAsync(
        Guid id,
        UpdateVacancyRequest request,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);
}
