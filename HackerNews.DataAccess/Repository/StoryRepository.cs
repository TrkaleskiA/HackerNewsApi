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
            var story = await _context.Stories
                .Include(s => s.Parts) // Include parts if needed
                .FirstOrDefaultAsync(s => s.Id == id);

            if (story != null)
            {
                // Fetch only the direct comments (kids) where CommentId is null
                story.Kids = await _context.Comments
                    .Where(c => c.StoryId == id && c.CommentId == null) // Only direct comments
                    .ToListAsync();
            }

            return story;
        }



        public async Task<IEnumerable<Story>> GetAllStoriesAsync()
        {
            var stories = await _context.Stories
                .Include(s => s.Parts) // Include parts if needed
                .ToListAsync();

            foreach (var story in stories)
            {
                // Fetch only the direct comments (kids) where CommentId is null for each story
                story.Kids = await _context.Comments
                    .Where(c => c.StoryId == story.Id && c.CommentId == null)
                    .ToListAsync();
            }

            return stories;
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

        public Story GetStoryById(long storyId)
        {
            return _context.Stories.FirstOrDefault(s => s.Id == storyId);
        }

        public void UpdateStory(Story story)
        {
            _context.Stories.Update(story);
            _context.SaveChanges();
        }

    }
}
