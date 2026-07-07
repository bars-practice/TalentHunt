using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TalentHunt.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddApplicationSoftDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Applications_CandidateId_VacancyId",
                table: "Applications");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Applications",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Applications_CandidateId_VacancyId",
                table: "Applications",
                columns: new[] { "CandidateId", "VacancyId" },
                unique: true,
                filter: "\"IsDeleted\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Applications_CandidateId_VacancyId",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Applications");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_CandidateId_VacancyId",
                table: "Applications",
                columns: new[] { "CandidateId", "VacancyId" },
                unique: true);
        }
    }
}
