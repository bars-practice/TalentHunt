using TalentHunt.Application.DTO;
using TalentHunt.Application.Enums;
using TalentHunt.Application.Interfaces;
using ApplicationEntity = TalentHunt.Application.Entities.Application;

namespace TalentHunt.Application.Services;

public class ApplicationService(
    IApplicationRepository applicationRepository,
    ICandidateRepository candidateRepository,
    IVacancyRepository vacancyRepository) : IApplicationService
{
    public async Task<IEnumerable<ApplicationResponse>> GetAllAsync(
        Guid? approverUserId = null,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var applications = await applicationRepository.GetAllAsync(approverUserId, includeDeleted, cancellationToken);
        return applications.Select(ToResponse);
    }

    public async Task<ApplicationResponse> GetByIdAsync(
        Guid id,
        Guid? approverUserId = null,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var application = await applicationRepository.GetByIdAsync(id, approverUserId, includeDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Отклик не найден.");

        return ToResponse(application);
    }

    public async Task<ApplicationResponse> CreateAsync(
        CreateApplicationRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidateCandidateAndVacancyAsync(request.CandidateId, request.VacancyId, cancellationToken);

        if (await applicationRepository.PairExistsAsync(
                request.CandidateId, request.VacancyId, cancellationToken: cancellationToken))
            throw new InvalidOperationException("Отклик этого кандидата на данную вакансию уже существует.");

        var vacancy = await vacancyRepository.GetByIdWithCompetenciesAsync(request.VacancyId, cancellationToken: cancellationToken);

        var application = new ApplicationEntity
        {
            Id = Guid.NewGuid(),
            VacancyId = request.VacancyId,
            CandidateId = request.CandidateId,
            Status = ApplicationStatus.Applied,
            ApproverId = vacancy?.ApproverId
        };

        await applicationRepository.AddAsync(application, cancellationToken);
        await applicationRepository.SaveAsync(cancellationToken);

        var created = await applicationRepository.GetByIdAsync(application.Id, includeDeleted: false, cancellationToken: cancellationToken);
        return ToResponse(created!);
    }

    public async Task<ApplicationResponse> UpdateAsync(
        Guid id,
        UpdateApplicationRequest request,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var application = await applicationRepository.GetByIdAsync(id, includeDeleted: includeDeleted, cancellationToken: cancellationToken)
            ?? throw new KeyNotFoundException("Отклик не найден.");

        if (application.IsDeleted && !includeDeleted)
            throw new InvalidOperationException("Нельзя изменить удалённый отклик.");

        if (request.Status.HasValue)
            throw new InvalidOperationException("Статус отклика изменяется автоматически или через решение Решалы.");

        if (request.IsDeleted.HasValue)
        {
            if (!includeDeleted)
                throw new InvalidOperationException("Недостаточно прав для изменения статуса архивации.");

            application.IsDeleted = request.IsDeleted.Value;
        }

        await applicationRepository.UpdateAsync(application);
        await applicationRepository.SaveAsync(cancellationToken);

        var updated = await applicationRepository.GetByIdAsync(id, includeDeleted: includeDeleted, cancellationToken: cancellationToken);
        return ToResponse(updated!);
    }

    public async Task<ApplicationResponse> DecideAsync(
        Guid id,
        ApplicationDecisionRequest request,
        Guid decidedByUserId,
        CancellationToken cancellationToken = default)
    {
        if (request.Status is not (ApplicationStatus.Approved or ApplicationStatus.Rejected))
            throw new InvalidOperationException("Решала может установить только статус Approved или Rejected.");

        var application = await applicationRepository.GetByIdAsync(id, cancellationToken: cancellationToken)
            ?? throw new KeyNotFoundException("Отклик не найден.");

        if (application.Status != ApplicationStatus.PendingDecision)
            throw new InvalidOperationException("Решение можно вынести только для отклика в статусе PendingDecision.");

        application.Status = request.Status;
        application.DecidedByUserId = decidedByUserId;
        application.DecidedAt = DateTime.UtcNow;

        await applicationRepository.UpdateAsync(application);
        await applicationRepository.SaveAsync(cancellationToken);

        var updated = await applicationRepository.GetByIdAsync(id, cancellationToken: cancellationToken);
        return ToResponse(updated!);
    }

    public async Task DeleteAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var application = await applicationRepository.GetByIdAsync(id, includeDeleted: includeDeleted, cancellationToken: cancellationToken)
            ?? throw new KeyNotFoundException("Отклик не найден.");

        if (application.IsDeleted)
            return;

        await applicationRepository.DeleteAsync(application);
        await applicationRepository.SaveAsync(cancellationToken);
    }

    private async Task ValidateCandidateAndVacancyAsync(
        Guid candidateId,
        Guid vacancyId,
        CancellationToken cancellationToken)
    {
        var candidate = await candidateRepository.GetByIdAsync(candidateId, cancellationToken: cancellationToken);
        if (candidate is null)
            throw new InvalidOperationException("Кандидат не найден.");

        var vacancy = await vacancyRepository.GetByIdWithCompetenciesAsync(vacancyId, cancellationToken: cancellationToken);
        if (vacancy is null)
            throw new InvalidOperationException("Вакансия не найдена.");
    }

    private static ApplicationResponse ToResponse(ApplicationEntity application) => new(
        application.Id,
        application.VacancyId,
        application.Vacancy?.Title ?? string.Empty,
        application.CandidateId,
        application.Candidate?.FullName ?? string.Empty,
        application.Candidate?.Phone ?? string.Empty,
        application.Candidate?.City ?? string.Empty,
        application.Candidate?.Education ?? string.Empty,
        application.Candidate?.Experience ?? string.Empty,
        application.Candidate?.PlacesOfWork ?? [],
        application.Status,
        application.Interview?.IsDeleted == false ? application.Interview.Id : null,
        application.Interview?.IsDeleted == false ? application.Interview.ScheduledAt : null,
        application.DecidedByUserId,
        application.ApproverId,
        application.Approver?.FullName,
        application.DecidedBy?.FullName,
        application.DecidedAt,
        application.IsDeleted
    );
}
