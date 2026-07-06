using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TalentHunt.Application.Entities;

namespace TalentHunt.Infrastructure.Configurations;

public class InterviewConfiguration : IEntityTypeConfiguration<Interview>
{
    public void Configure(EntityTypeBuilder<Interview> builder)
    {
        builder.HasKey(i => i.Id);

        builder.HasIndex(i => i.ApplicationId)
            .IsUnique();

        builder.HasOne(i => i.Application)
            .WithOne(a => a.Interview)
            .HasForeignKey<Interview>(i => i.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
