using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using TalentHunt.Application.Entities;

#nullable disable

namespace TalentHunt.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInterviewDetailsAndPendingDecision : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Interviews_ApplicationId",
                table: "Interviews");

            migrationBuilder.AddColumn<string>(
                name: "GeneralConclusion",
                table: "Interviews",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "InterviewerId",
                table: "Interviews",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Interviews",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Plan",
                table: "Interviews",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledAt",
                table: "Interviews",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<List<SkillMatrixEntry>>(
                name: "SkillMatrix",
                table: "Interviews",
                type: "jsonb",
                nullable: false,
                defaultValueSql: "'[]'");

            migrationBuilder.AddColumn<DateTime>(
                name: "DecidedAt",
                table: "Applications",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DecidedByUserId",
                table: "Applications",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_ApplicationId",
                table: "Interviews",
                column: "ApplicationId",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_InterviewerId",
                table: "Interviews",
                column: "InterviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_DecidedByUserId",
                table: "Applications",
                column: "DecidedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Users_DecidedByUserId",
                table: "Applications",
                column: "DecidedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Interviews_Users_InterviewerId",
                table: "Interviews",
                column: "InterviewerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Users_DecidedByUserId",
                table: "Applications");

            migrationBuilder.DropForeignKey(
                name: "FK_Interviews_Users_InterviewerId",
                table: "Interviews");

            migrationBuilder.DropIndex(
                name: "IX_Interviews_ApplicationId",
                table: "Interviews");

            migrationBuilder.DropIndex(
                name: "IX_Interviews_InterviewerId",
                table: "Interviews");

            migrationBuilder.DropIndex(
                name: "IX_Applications_DecidedByUserId",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "GeneralConclusion",
                table: "Interviews");

            migrationBuilder.DropColumn(
                name: "InterviewerId",
                table: "Interviews");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Interviews");

            migrationBuilder.DropColumn(
                name: "Plan",
                table: "Interviews");

            migrationBuilder.DropColumn(
                name: "ScheduledAt",
                table: "Interviews");

            migrationBuilder.DropColumn(
                name: "SkillMatrix",
                table: "Interviews");

            migrationBuilder.DropColumn(
                name: "DecidedAt",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "DecidedByUserId",
                table: "Applications");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_ApplicationId",
                table: "Interviews",
                column: "ApplicationId",
                unique: true);
        }
    }
}
