using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TalentHunt.Application.Entities;

namespace TalentHunt.Infrastructure.Configurations;

public class InterviewConfiguration : IEntityTypeConfiguration<Interview>
{
    public void Configure(EntityTypeBuilder<Interview> builder)
    {
        builder.HasKey(i => i.Id);

        builder.Property(i => i.Plan)
            .IsRequired()
            .HasDefaultValue(string.Empty);

        builder.Property(i => i.GeneralConclusion)
            .IsRequired()
            .HasDefaultValue(string.Empty);

        builder.Property(i => i.SkillMatrix)
            .HasColumnType("jsonb")
            .HasDefaultValueSql("'[]'");

        builder.Property(i => i.IsDeleted)
            .HasDefaultValue(false);

        builder.HasQueryFilter(i => !i.IsDeleted);

        builder.HasIndex(i => i.ApplicationId)
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");

        builder.HasOne(i => i.Application)
            .WithOne(a => a.Interview)
            .HasForeignKey<Interview>(i => i.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(i => i.Interviewer)
            .WithMany()
            .HasForeignKey(i => i.InterviewerId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
