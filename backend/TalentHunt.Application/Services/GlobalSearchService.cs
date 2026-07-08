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
        string query,
        int page,
        int pageSize,
        Role callerRole,
        Guid? callerUserId,
        CancellationToken cancellationToken = default)
    {
        (page, pageSize) = NormalizePagination(page, pageSize);

        if (string.IsNullOrWhiteSpace(query) || query.Trim().Length < MinQueryLength)
            return Empty(page, pageSize);

        var cleanQuery = query.Trim();
        Guid? approverId = callerRole == Role.Approver ? callerUserId : null;

        var titleMatchIds = await vacancyRepository.SearchIdsByTextAsync(
            cleanQuery,
            approverId,
            cancellationToken);

        var applicationMatches = await applicationRepository.SearchForGlobalByCandidateAsync(
            cleanQuery,
            approverId,
            cancellationToken);

        var allVacancyIds = titleMatchIds
            .Concat(applicationMatches.Select(a => a.VacancyId))
            .Distinct()
            .ToList();

        if (allVacancyIds.Count == 0)
            return Empty(page, pageSize);

        var vacancies = await vacancyRepository.GetByIdsForGlobalSearchAsync(
            allVacancyIds,
            approverId,
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
