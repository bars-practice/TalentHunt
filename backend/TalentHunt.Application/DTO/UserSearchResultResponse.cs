namespace TalentHunt.Application.DTO;

public record UserSearchResultResponse(
    Guid Id,
    string Login,
    string FullName
);
