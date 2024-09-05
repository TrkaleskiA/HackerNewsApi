using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HackerNews.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddLikeStoryIdsToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LikedStoryIds",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LikedStoryIds",
                table: "Users");
        }
    }
}
