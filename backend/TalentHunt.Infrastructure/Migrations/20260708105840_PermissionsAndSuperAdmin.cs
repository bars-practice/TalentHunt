using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TalentHunt.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PermissionsAndSuperAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.Sql("""
                DELETE FROM "UserPermissions";
                DELETE FROM "Permissions";

                INSERT INTO "Permissions" ("Id", "Name", "DisplayName") VALUES
                (gen_random_uuid(), 'CanViewCandidates', 'Просмотр кандидатов'),
                (gen_random_uuid(), 'CanManageCandidates', 'Управление кандидатами'),
                (gen_random_uuid(), 'CanViewApplications', 'Просмотр откликов'),
                (gen_random_uuid(), 'CanManageApplications', 'Управление откликами'),
                (gen_random_uuid(), 'CanViewInterviews', 'Просмотр собеседований'),
                (gen_random_uuid(), 'CanManageInterviews', 'Управление собеседованиями'),
                (gen_random_uuid(), 'CanMakeDecision', 'Вынесение решения'),
                (gen_random_uuid(), 'CanViewVacancies', 'Просмотр вакансий'),
                (gen_random_uuid(), 'CanManageVacancies', 'Управление вакансиями'),
                (gen_random_uuid(), 'CanManageCompetencies', 'Управление компетенциями'),
                (gen_random_uuid(), 'CanExportDocuments', 'Экспорт документов');

                UPDATE "Users" SET "Role" = 3 WHERE "Login" = 'admin';

                INSERT INTO "UserPermissions" ("UserId", "PermissionId")
                SELECT u."Id", p."Id"
                FROM "Users" u
                CROSS JOIN "Permissions" p
                WHERE u."Role" = 1 AND p."Name" <> 'CanMakeDecision';

                INSERT INTO "UserPermissions" ("UserId", "PermissionId")
                SELECT u."Id", p."Id"
                FROM "Users" u
                INNER JOIN "Permissions" p ON p."Name" IN (
                    'CanViewApplications',
                    'CanViewInterviews',
                    'CanViewVacancies',
                    'CanMakeDecision',
                    'CanExportDocuments')
                WHERE u."Role" = 2;

                INSERT INTO "UserPermissions" ("UserId", "PermissionId")
                SELECT u."Id", p."Id"
                FROM "Users" u
                CROSS JOIN "Permissions" p
                WHERE u."Role" IN (0, 3);
                """);

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
