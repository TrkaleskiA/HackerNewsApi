using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HackerNews.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddPollOptionsVotedIdsToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PollOptionsVotedIds",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PollOptionsVotedIds",
                table: "Users");
        }
    }
}
