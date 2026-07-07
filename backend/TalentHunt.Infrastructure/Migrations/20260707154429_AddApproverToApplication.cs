using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TalentHunt.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddApproverToApplication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ApproverId",
                table: "Applications",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Applications_ApproverId",
                table: "Applications",
                column: "ApproverId");

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Users_ApproverId",
                table: "Applications",
                column: "ApproverId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Users_ApproverId",
                table: "Applications");

            migrationBuilder.DropIndex(
                name: "IX_Applications_ApproverId",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "ApproverId",
                table: "Applications");
        }
    }
}
