using TalentHunt.Application.DTO;
using TalentHunt.Application.Entities;
using TalentHunt.Application.Interfaces;

namespace TalentHunt.Application.Services;

public class CompetencyService(ICompetencyRepository competencyRepository) : ICompetencyService
{
    public async Task<IEnumerable<CompetencyResponse>> GetAllAsync(
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var competencies = await competencyRepository.GetAllAsync(includeDeleted, cancellationToken);
        return competencies.Select(ToResponse);
    }

    public async Task<CompetencyResponse> CreateAsync(
        CreateCompetencyRequest request,
        CancellationToken cancellationToken = default)
    {
        var name = NormalizeName(request.Name);

        if (await competencyRepository.NameExistsAsync(name, cancellationToken: cancellationToken))
            throw new InvalidOperationException($"Компетенция с названием '{name}' уже существует.");

        var competency = new Competency
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = request.Description?.Trim() ?? string.Empty
        };

        await competencyRepository.AddAsync(competency, cancellationToken);
        await competencyRepository.SaveAsync(cancellationToken);

        return ToResponse(competency);
    }

    public async Task<CompetencyResponse> UpdateAsync(
        Guid id,
        UpdateCompetencyRequest request,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var competency = await competencyRepository.GetByIdAsync(id, includeDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Компетенция не найдена.");

        if (competency.IsDeleted)
            throw new InvalidOperationException("Нельзя изменить удалённую компетенцию.");

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            var name = NormalizeName(request.Name);
            if (await competencyRepository.NameExistsAsync(name, id, cancellationToken))
                throw new InvalidOperationException($"Компетенция с названием '{name}' уже существует.");

            competency.Name = name;
        }

        if (request.Description is not null)
            competency.Description = request.Description.Trim();

        await competencyRepository.UpdateAsync(competency);
        await competencyRepository.SaveAsync(cancellationToken);

        return ToResponse(competency);
    }

    public async Task DeleteAsync(
        Guid id,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var competency = await competencyRepository.GetByIdAsync(id, includeDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Компетенция не найдена.");

        if (competency.IsDeleted)
            return;

        await competencyRepository.DeleteAsync(competency);
        await competencyRepository.SaveAsync(cancellationToken);
    }

    private static string NormalizeName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new InvalidOperationException("Name is required.");

        return name.Trim();
    }

    private static CompetencyResponse ToResponse(Competency competency) =>
        new(competency.Id, competency.Name, competency.Description, competency.IsDeleted);
}
