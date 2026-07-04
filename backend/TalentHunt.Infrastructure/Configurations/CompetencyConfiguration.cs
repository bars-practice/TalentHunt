using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TalentHunt.Application.Entities;

namespace TalentHunt.Infrastructure.Configurations;

public class CompetencyConfiguration : IEntityTypeConfiguration<Competency>
{
    public void Configure(EntityTypeBuilder<Competency> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasIndex(c => c.Name)
            .IsUnique();

        builder.Property(c => c.Description)
            .IsRequired();

        builder.Property(c => c.IsDeleted)
            .HasDefaultValue(false);

        builder.HasQueryFilter(c => !c.IsDeleted);
    }
}
