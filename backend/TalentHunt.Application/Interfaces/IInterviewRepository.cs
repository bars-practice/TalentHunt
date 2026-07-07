using TalentHunt.Application.DTO;
using TalentHunt.Application.Enums;

namespace TalentHunt.Application.Interfaces;

public interface IInterviewRepository
{
    Task<IReadOnlyList<Entities.Interview>> GetAllAsync(
        Guid? candidateId = null,
        Guid? vacancyId = null,
        ApplicationStatus? applicationStatus = null,
        Guid? approverUserId = null,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task<Entities.Interview?> GetByIdAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task<Entities.Interview?> GetByApplicationIdAsync(
        Guid applicationId,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default);

    Task AddAsync(Entities.Interview interview, CancellationToken cancellationToken = default);

    Task UpdateAsync(Entities.Interview interview);

    Task DeleteAsync(Entities.Interview interview);

    Task SaveAsync(CancellationToken cancellationToken = default);
}
