using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Yiodara.Infrastructure.Migrations
{
    public partial class addedCompanyProfileAndOrganizationName : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CompanyProfile",
                table: "Campaigns",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OrganizationName",
                table: "Campaigns",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompanyProfile",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "OrganizationName",
                table: "Campaigns");
        }
    }
}
