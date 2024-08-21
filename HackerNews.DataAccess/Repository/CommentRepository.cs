using HackerNews.DataAccess.Entities;
using HackerNews.DataAccess.Repository.RepositoryInterfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HackerNews.DataAccess.Repository
{
    public class CommentRepository : ICommentRepository
    {
        private readonly ApplicationDbContext _context;

        public CommentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Comment> GetCommentByIdAsync(long id)
        {
            return await _context.Comments
                .Include(c => c.Kids) // Include the kids (replies) of the comment
                .FirstOrDefaultAsync(c => c.Id == id);
        }


        public async Task<IEnumerable<Comment>> GetAllCommentsAsync()
        {
            return await _context.Set<Comment>().ToListAsync();
        }

        public async Task AddCommentAsync(Comment comment)
        {
            await _context.Set<Comment>().AddAsync(comment);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateCommentAsync(Comment comment)
        {
            _context.Set<Comment>().Update(comment);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Comment>> GetCommentsByParentIdAsync(long parentId, bool fetchReplies)
        {
            if (fetchReplies)
            {
                // Fetch replies to a specific parent comment
                return await _context.Comments
                    .Where(c => c.CommentId == parentId) // Replies only
                    .Include(c => c.Kids) // Include kids (replies) of the comment
                    .ThenInclude(kid => kid.Kids) // Include nested replies as well
                    .ToListAsync();
            }
            else
            {
                // Fetch main comments associated with a story
                return await _context.Comments
                    .Where(c => c.StoryId == parentId && c.CommentId == null) // Main comments only
                    .Include(c => c.Kids) // Include kids (replies) of the comment
                    .ThenInclude(kid => kid.Kids) // Include nested replies as well
                    .ToListAsync();
            }
        }




    }
}
