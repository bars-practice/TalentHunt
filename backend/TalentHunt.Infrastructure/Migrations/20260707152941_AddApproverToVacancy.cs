using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TalentHunt.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddApproverToVacancy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ApproverId",
                table: "Vacancies",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vacancies_ApproverId",
                table: "Vacancies",
                column: "ApproverId");

            migrationBuilder.AddForeignKey(
                name: "FK_Vacancies_Users_ApproverId",
                table: "Vacancies",
                column: "ApproverId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vacancies_Users_ApproverId",
                table: "Vacancies");

            migrationBuilder.DropIndex(
                name: "IX_Vacancies_ApproverId",
                table: "Vacancies");

            migrationBuilder.DropColumn(
                name: "ApproverId",
                table: "Vacancies");
        }
    }
}
