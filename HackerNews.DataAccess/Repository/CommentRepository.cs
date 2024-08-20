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

        public async Task<IEnumerable<Comment>> GetCommentsByParentIdAsync(long parentId)
        {
            // Check if the parentId is likely a StoryId or a CommentId
            // If fetching replies, parentId is a CommentId
            // If fetching main comments, parentId is a StoryId and CommentId is null

            // Fetch comments that are replies to a comment
            var replies = await _context.Comments
                                        .Where(c => c.CommentId == parentId)
                                        .ToListAsync();

            // Fetch main comments associated with a story
            var mainComments = await _context.Comments
                                              .Where(c => c.StoryId == parentId && c.CommentId == null)
                                              .ToListAsync();

            // Combine both lists
            return mainComments.Concat(replies);
        }



    }
}
