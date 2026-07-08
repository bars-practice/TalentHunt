namespace TalentHunt.Application.DTO;

public record CandidateSearchResultResponse(
    Guid Id,
    string FullName,
    string City
);
