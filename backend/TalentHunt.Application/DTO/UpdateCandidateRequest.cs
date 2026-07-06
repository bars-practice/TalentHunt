namespace TalentHunt.Application.DTO;

public record UpdateCandidateRequest(
    string? FullName = null,
    string? Phone = null,
    string? City = null,
    string? Skills = null,
    string? Education = null,
    string? Experience = null,
    List<string>? PlacesOfWork = null,
    bool? IsDeleted = null
);
