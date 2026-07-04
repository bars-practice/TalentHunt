using TalentHunt.Application.DTO;

namespace TalentHunt.Application.Interfaces;

public interface IVacancyService
{
    Task<IEnumerable<VacancyResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<VacancyResponse> CreateAsync(CreateVacancyRequest request, CancellationToken cancellationToken = default);

    Task<VacancyResponse> UpdateAsync(Guid id, UpdateVacancyRequest request, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
