using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Yiodara.Infrastructure.Migrations
{
    public partial class addedOtherSupportProvidedToPartnersTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OtherSupportProvided",
                table: "Partners",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OtherSupportProvided",
                table: "Partners");
        }
    }
}
