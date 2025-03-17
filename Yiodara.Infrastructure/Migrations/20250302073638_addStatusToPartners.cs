using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Yiodara.Infrastructure.Migrations
{
    public partial class addStatusToPartners : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Partners",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_CampaignId",
                table: "PaymentTransactions",
                column: "CampaignId");

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentTransactions_Campaigns_CampaignId",
                table: "PaymentTransactions",
                column: "CampaignId",
                principalTable: "Campaigns",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PaymentTransactions_Campaigns_CampaignId",
                table: "PaymentTransactions");

            migrationBuilder.DropIndex(
                name: "IX_PaymentTransactions_CampaignId",
                table: "PaymentTransactions");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Partners");
        }
    }
}
