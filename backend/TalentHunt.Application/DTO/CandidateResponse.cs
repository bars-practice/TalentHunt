namespace TalentHunt.Application.DTO;

public record CandidateResponse(
    Guid Id,
    string FullName,
    string Phone,
    string City,
    string Skills,
    string Education,
    string Experience,
    List<string> PlacesOfWork,
    bool IsDeleted
);
