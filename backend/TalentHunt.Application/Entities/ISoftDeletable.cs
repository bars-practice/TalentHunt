namespace TalentHunt.Application.Entities;

public interface ISoftDeletable
{
    bool IsDeleted { get; set; }
}
