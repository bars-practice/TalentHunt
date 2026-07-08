using TalentHunt.Application.DTO;
using TalentHunt.Application.Entities;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.Application.Services;

public class VacancyService(
    IVacancyRepository vacancyRepository,
    ICompetencyRepository competencyRepository) : IVacancyService
{
    public async Task<IEnumerable<VacancyResponse>> GetAllAsync(
        Guid? approverUserId = null,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var vacancies = await vacancyRepository.GetAllWithCompetenciesAsync(approverUserId, includeDeleted, cancellationToken);
        return vacancies.Select(ToResponse);
    }

    public async Task<VacancyResponse> CreateAsync(
        CreateVacancyRequest request,
        CancellationToken cancellationToken = default)
    {
        var title = NormalizeRequired(request.Title, "Title");
        var businessUnit = NormalizeRequired(request.BusinessUnit, "BusinessUnit");
        var competencyIds = request.CompetencyIds ?? [];

        if (competencyIds.Count == 0)
            throw new InvalidOperationException("Вакансия должна содержать хотя бы одну компетенцию.");

        await ValidateCompetencyIdsAsync(competencyIds, cancellationToken);

        var vacancy = new Vacancy
        {
            Id = Guid.NewGuid(),
            Title = title,
            Level = request.Level,
            BusinessUnit = businessUnit,
            Description = request.Description?.Trim() ?? string.Empty,
            ApproverId = request.ApproverId
        };

        await vacancyRepository.AddAsync(vacancy, cancellationToken);

        if (competencyIds.Count > 0)
            await vacancyRepository.ReplaceCompetenciesAsync(vacancy.Id, competencyIds, cancellationToken);

        await vacancyRepository.SaveAsync(cancellationToken);

        var created = await vacancyRepository.GetByIdWithCompetenciesAsync(vacancy.Id, cancellationToken: cancellationToken);
        return ToResponse(created!);
    }

    public async Task<VacancyResponse> UpdateAsync(
        Guid id,
        UpdateVacancyRequest request,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var vacancy = await vacancyRepository.GetByIdWithCompetenciesAsync(id, includeDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Вакансия не найдена.");

        if (vacancy.IsDeleted && (!request.IsDeleted.HasValue || request.IsDeleted.Value))
            throw new InvalidOperationException("Нельзя изменить удалённую вакансию.");

        if (!string.IsNullOrWhiteSpace(request.Title))
            vacancy.Title = NormalizeRequired(request.Title, "Title");

        if (request.Level.HasValue)
            vacancy.Level = request.Level.Value;

        if (!string.IsNullOrWhiteSpace(request.BusinessUnit))
            vacancy.BusinessUnit = NormalizeRequired(request.BusinessUnit, "BusinessUnit");

        if (request.Description is not null)
            vacancy.Description = request.Description.Trim();

        if (request.IsDeleted.HasValue)
            vacancy.IsDeleted = request.IsDeleted.Value;

        if (request.ApproverId.HasValue)
            vacancy.ApproverId = request.ApproverId.Value;

        await vacancyRepository.UpdateAsync(vacancy);

        if (request.CompetencyIds is not null)
        {
            var competencyIds = request.CompetencyIds.Distinct().ToList();
            if (competencyIds.Count == 0)
                throw new InvalidOperationException("Вакансия должна содержать хотя бы одну компетенцию.");

            await ValidateCompetencyIdsAsync(competencyIds, cancellationToken);
            await vacancyRepository.ReplaceCompetenciesAsync(id, competencyIds, cancellationToken);
        }

        await vacancyRepository.SaveAsync(cancellationToken);

        var updated = await vacancyRepository.GetByIdWithCompetenciesAsync(
            id, 
            includeDeleted || vacancy.IsDeleted, 
            cancellationToken);

        return ToResponse(updated!);
    }

    public async Task DeleteAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var vacancy = await vacancyRepository.GetByIdWithCompetenciesAsync(id, includeDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Вакансия не найдена.");

        if (vacancy.IsDeleted)
            return;

        await vacancyRepository.DeleteAsync(vacancy);
        await vacancyRepository.SaveAsync(cancellationToken);
    }

    private async Task ValidateCompetencyIdsAsync(
        IReadOnlyList<Guid> competencyIds,
        CancellationToken cancellationToken)
    {
        if (competencyIds.Count == 0)
            return;

        var distinctIds = competencyIds.Distinct().ToList();
        var found = await competencyRepository.GetByIdsAsync(distinctIds, cancellationToken);

        if (found.Count != distinctIds.Count)
            throw new InvalidOperationException("Одна или несколько компетенций не найдены.");
    }

    private static string NormalizeRequired(string value, string fieldName)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new InvalidOperationException($"{fieldName} is required.");

        return value.Trim();
    }

    private static VacancyResponse ToResponse(Vacancy vacancy) => new(
        vacancy.Id,
        vacancy.Title,
        vacancy.Level,
        vacancy.BusinessUnit,
        vacancy.Description,
        vacancy.ApproverId,
        vacancy.Approver?.FullName,
        vacancy.VacancyCompetencies
            .Where(vc => vc.Competency is not null)
            .Select(vc => new CompetencyResponse(
                vc.Competency.Id,
                vc.Competency.Name,
                vc.Competency.Description,
                vc.Competency.IsDeleted))
            .OrderBy(c => c.Name)
            .ToList(),
        vacancy.IsDeleted
    );
}
