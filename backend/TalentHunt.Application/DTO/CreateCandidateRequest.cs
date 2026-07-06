namespace TalentHunt.Application.DTO;

public record CreateCandidateRequest(
    string FullName,
    string Phone,
    string City,
    string Skills,
    string Education,
    string Experience,
    List<string>? PlacesOfWork = null
);
