using Microsoft.EntityFrameworkCore;
using HackerNews.DataAccess.Entities;

namespace HackerNews.DataAccess
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<YourEntity> YourEntities { get; set; }
        public DbSet<User> Users { get; set; }
    }

    public class YourEntity
    {
        public int Id { get; set; }
        public string Name { get; set; }
        // Other properties
    }


}
