using HackerNews.DataAccess.Entities;
using HackerNews.DataAccess.Repository.RepositoryInterfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HackerNews.DataAccess.Repository
{
    public class StoryRepository : IStoryRepository
    {
        private readonly ApplicationDbContext _context;

        public StoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Story> GetStoryByIdAsync(long id)
        {
            return await _context.Stories
                .Include(s => s.Kids)
                .Include(s => s.Parts) // Include parts if needed
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<IEnumerable<Story>> GetAllStoriesAsync()
        {
            return await _context.Stories
                .Include(s => s.Kids)
                .Include(s => s.Parts) // Include parts if needed
                .ToListAsync();
        }

        public async Task AddStoryAsync(Story story)
        {
            await _context.Stories.AddAsync(story);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateStoryAsync(Story story)
        {
            _context.Set<Story>().Update(story);
            await _context.SaveChangesAsync();
        }
    }
}
