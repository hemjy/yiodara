using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Yiodara.Infrastructure.Migrations
{
    public partial class addCampaignReportField : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CampaignReport",
                table: "Campaigns",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CampaignReport",
                table: "Campaigns");
        }
    }
}
