using TalentHunt.Application.DTO;
using TalentHunt.Application.Entities;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.Application.Services;

public class CandidateService(ICandidateRepository candidateRepository) : ICandidateService
{
    private const int MinQueryLength = 1;
    private const int MaxResults = 10;
    private const int RegistrySearchLimit = 100;

    public async Task<IEnumerable<CandidateResponse>> GetAllAsync(
        bool includeDeleted = false,
        Guid? excludeVacancyId = null,
        CancellationToken cancellationToken = default)
    {
        var candidates = await candidateRepository.GetAllAsync(includeDeleted, excludeVacancyId, cancellationToken);
        return candidates.Select(ToResponse);
    }

    public async Task<CandidateResponse> GetByIdAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var candidate = await candidateRepository.GetByIdAsync(id, includeDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Кандидат не найден.");

        return ToResponse(candidate);
    }

    public async Task<CandidateResponse> CreateAsync(
        CreateCandidateRequest request,
        CancellationToken cancellationToken = default)
    {
        var candidate = new Candidate
        {
            Id = Guid.NewGuid(),
            FullName = NormalizeRequired(request.FullName, "FullName"),
            Phone = request.Phone?.Trim() ?? string.Empty,
            City = request.City?.Trim() ?? string.Empty,
            Skills = request.Skills?.Trim() ?? string.Empty,
            Education = request.Education?.Trim() ?? string.Empty,
            Experience = request.Experience?.Trim() ?? string.Empty,
            PlacesOfWork = NormalizePlacesOfWork(request.PlacesOfWork)
        };

        await candidateRepository.AddAsync(candidate, cancellationToken);
        await candidateRepository.SaveAsync(cancellationToken);

        return ToResponse(candidate);
    }

    public async Task<CandidateResponse> UpdateAsync(
        Guid id,
        UpdateCandidateRequest request,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var candidate = await candidateRepository.GetByIdAsync(id, includeDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Кандидат не найден.");

        if (candidate.IsDeleted && !includeDeleted)
            throw new InvalidOperationException("Нельзя изменить удалённого кандидата.");

        if (request.IsDeleted.HasValue)
        {
            if (!includeDeleted)
                throw new InvalidOperationException("Недостаточно прав для восстановления кандидата.");

            candidate.IsDeleted = request.IsDeleted.Value;
        }

        if (!string.IsNullOrWhiteSpace(request.FullName))
            candidate.FullName = NormalizeRequired(request.FullName, "FullName");

        if (request.Phone is not null)
            candidate.Phone = request.Phone.Trim();

        if (request.City is not null)
            candidate.City = request.City.Trim();

        if (request.Skills is not null)
            candidate.Skills = request.Skills.Trim();

        if (request.Education is not null)
            candidate.Education = request.Education.Trim();

        if (request.Experience is not null)
            candidate.Experience = request.Experience.Trim();

        if (request.PlacesOfWork is not null)
            candidate.PlacesOfWork = NormalizePlacesOfWork(request.PlacesOfWork);

        await candidateRepository.UpdateAsync(candidate);
        await candidateRepository.SaveAsync(cancellationToken);

        return ToResponse(candidate);
    }

    public async Task DeleteAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var candidate = await candidateRepository.GetByIdAsync(id, includeDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Кандидат не найден.");

        if (candidate.IsDeleted)
            return;

        await candidateRepository.DeleteAsync(candidate);
        await candidateRepository.SaveAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CandidateSearchResultResponse>> SearchAsync(
        string query,
        Guid? excludeVacancyId = null,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Trim().Length < MinQueryLength)
            return [];

        var limit = excludeVacancyId.HasValue ? MaxResults : RegistrySearchLimit;

        var candidates = await candidateRepository.SearchAsync(
            query.Trim(),
            limit,
            excludeVacancyId,
            includeDeleted,
            cancellationToken);

        return candidates
            .Select(c => new CandidateSearchResultResponse(c.Id, c.FullName, c.City, c.IsDeleted))
            .ToList();
    }

    private static string NormalizeRequired(string value, string fieldName)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new InvalidOperationException($"{fieldName} is required.");

        return value.Trim();
    }

    private static List<string> NormalizePlacesOfWork(IEnumerable<string>? places) =>
        places?
            .Select(p => p.Trim())
            .Where(p => !string.IsNullOrEmpty(p))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList()
        ?? [];

    private static CandidateResponse ToResponse(Candidate candidate) => new(
        candidate.Id,
        candidate.FullName,
        candidate.Phone,
        candidate.City,
        candidate.Skills,
        candidate.Education,
        candidate.Experience,
        candidate.PlacesOfWork,
        candidate.IsDeleted
    );
}
