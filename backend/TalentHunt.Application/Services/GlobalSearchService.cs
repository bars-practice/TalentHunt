using TalentHunt.Application.DTO;
using TalentHunt.Application.Enums;
using TalentHunt.Application.Interfaces;
using ApplicationEntity = TalentHunt.Application.Entities.Application;

namespace TalentHunt.Application.Services;

public class GlobalSearchService(
    IVacancyRepository vacancyRepository,
    IApplicationRepository applicationRepository) : IGlobalSearchService
{
    private const int MinQueryLength = 1;
    private const int DefaultPageSize = 10;
    private const int MaxPageSize = 20;

    public async Task<GlobalSearchResponse> SearchAsync(
        string? query,
        int page,
        int pageSize,
        Role callerRole,
        Guid? callerUserId,
        IReadOnlyList<int>? levels = null,
        IReadOnlyList<int>? candidateStatuses = null,
        string? city = null,
        string? vacancyStatus = null,
        CancellationToken cancellationToken = default)
    {
        (page, pageSize) = NormalizePagination(page, pageSize);

        var cleanQuery = (query ?? string.Empty).Trim();
        var hasQuery = cleanQuery.Length >= MinQueryLength;
        var hasCandidateFilter = candidateStatuses is { Count: > 0 } || !string.IsNullOrWhiteSpace(city);
        var hasFilters = levels is { Count: > 0 }
            || hasCandidateFilter
            || !string.IsNullOrWhiteSpace(vacancyStatus);

        if (!hasQuery && !hasFilters)
            return Empty(page, pageSize);

        Guid? approverId = callerRole == Role.Approver ? callerUserId : null;

        var titleMatchIds = await vacancyRepository.SearchIdsByTextAsync(
            cleanQuery,
            approverId,
            levels,
            vacancyStatus,
            cancellationToken);

        var applicationMatches = await applicationRepository.SearchForGlobalByCandidateAsync(
            cleanQuery,
            approverId,
            candidateStatuses,
            city,
            cancellationToken);

        // Когда активны фильтры по кандидатам, показываем только вакансии,
        // у которых есть подходящие кандидаты (пустые вакансии скрываем).
        var allVacancyIds = hasCandidateFilter
            ? applicationMatches.Select(a => a.VacancyId).Distinct().ToList()
            : titleMatchIds.Concat(applicationMatches.Select(a => a.VacancyId)).Distinct().ToList();

        if (allVacancyIds.Count == 0)
            return Empty(page, pageSize);

        var vacancies = await vacancyRepository.GetByIdsForGlobalSearchAsync(
            allVacancyIds,
            approverId,
            levels,
            vacancyStatus,
            cancellationToken);

        var totalCount = vacancies.Count;
        var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);

        var applicationsByVacancy = applicationMatches
            .GroupBy(a => a.VacancyId)
            .ToDictionary(g => g.Key, g => (IReadOnlyList<ApplicationEntity>)g.ToList());

        var items = vacancies
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(v => ToVacancyNode(v, applicationsByVacancy))
            .ToList();

        return new GlobalSearchResponse(
            items,
            page,
            pageSize,
            totalCount,
            totalPages,
            page < totalPages);
    }

    private static GlobalSearchVacancyNode ToVacancyNode(
        Entities.Vacancy vacancy,
        IReadOnlyDictionary<Guid, IReadOnlyList<ApplicationEntity>> applicationsByVacancy)
    {
        var applications = applicationsByVacancy.TryGetValue(vacancy.Id, out var apps)
            ? apps.Select(a => new GlobalSearchApplicationItem(
                a.Id,
                a.CandidateId,
                a.Candidate.FullName,
                a.Candidate.City,
                a.Status)).ToList()
            : [];

        return new GlobalSearchVacancyNode(
            vacancy.Id,
            vacancy.Title,
            vacancy.BusinessUnit,
            vacancy.IsDeleted,
            vacancy.Level,
            applications);
    }

    private static (int Page, int PageSize) NormalizePagination(int page, int pageSize)
    {
        var normalizedPage = page < 1 ? 1 : page;
        var normalizedPageSize = pageSize < 1 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);
        return (normalizedPage, normalizedPageSize);
    }

    private static GlobalSearchResponse Empty(int page, int pageSize) =>
        new([], page, pageSize, 0, 0, false);
}
