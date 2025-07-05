using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Yiodara.Infrastructure.Migrations
{
    public partial class addedPartnerTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AgreeToShareProvidedInfo",
                table: "Partners",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "AnyOtherComments",
                table: "Partners",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "CampaignId",
                table: "Partners",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "CompanyName",
                table: "Partners",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "CompanySize",
                table: "Partners",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "EmailAddress",
                table: "Partners",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "Partners",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "HowDoesYourOrganizationAimToContribute",
                table: "Partners",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Industry",
                table: "Partners",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "JobTitle",
                table: "Partners",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Partners",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "SupportProvided",
                table: "Partners",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "WebsiteUrl",
                table: "Partners",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "WhatImpactDoYouHopeToAchieve",
                table: "Partners",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Partners_CampaignId",
                table: "Partners",
                column: "CampaignId");

            migrationBuilder.AddForeignKey(
                name: "FK_Partners_Campaigns_CampaignId",
                table: "Partners",
                column: "CampaignId",
                principalTable: "Campaigns",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Partners_Campaigns_CampaignId",
                table: "Partners");

            migrationBuilder.DropIndex(
                name: "IX_Partners_CampaignId",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "AgreeToShareProvidedInfo",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "AnyOtherComments",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "CampaignId",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "CompanyName",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "CompanySize",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "EmailAddress",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "FullName",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "HowDoesYourOrganizationAimToContribute",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "Industry",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "JobTitle",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "SupportProvided",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "WebsiteUrl",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "WhatImpactDoYouHopeToAchieve",
                table: "Partners");
        }
    }
}
