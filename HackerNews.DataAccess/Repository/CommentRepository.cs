using HackerNews.DataAccess.Entities;
using HackerNews.DataAccess.Repository.RepositoryInterfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using HackerNewsApi.DTOs;

namespace HackerNews.DataAccess.Repository
{
    public class CommentRepository : ICommentRepository
    {
        private readonly ApplicationDbContext _context;

        public CommentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get a comment by ID
        public async Task<Comment> GetCommentByIdAsync(long id)
        {
            return await _context.Comments
                .Include(c => c.Kids)
                .FirstOrDefaultAsync(c => c.Id == id && c.CommentId == null); // Ensure it's a comment
        }

        // Get a reply by ID
        public async Task<Comment> GetReplyByIdAsync(long id)
        {
            return await _context.Comments
                .Include(c => c.Kids)
                .FirstOrDefaultAsync(c => c.Id == id && c.CommentId.HasValue); // Ensure it's a reply
        }

        // Get all comments
        public async Task<IEnumerable<Comment>> GetAllCommentsAsync()
        {
            return await _context.Comments
                .Where(c => c.CommentId == null) // Only main comments
                .Include(c => c.Kids)
                .ToListAsync();
        }

        // Get all replies
        public async Task<IEnumerable<Comment>> GetAllRepliesAsync()
        {
            return await _context.Comments
                .Where(c => c.CommentId.HasValue) // Only replies
                .Include(c => c.Kids)
                .ToListAsync();
        }

        // Add a comment
        public async Task AddCommentAsync(Comment comment)
        {
            await _context.Comments.AddAsync(comment);
            await _context.SaveChangesAsync();
        }

        public async Task AddReplyAsync(Comment reply)
        {
            // Fetch the parent comment or reply by `reply.CommentId`
            var parentComment = await _context.Comments
                .Include(c => c.Kids)
                .FirstOrDefaultAsync(c => c.Id == reply.CommentId);

            if (parentComment != null)
            {
                if (parentComment.Kids == null)
                    parentComment.Kids = new List<Comment>();

                // Add the reply
                await _context.Comments.AddAsync(reply);
                await _context.SaveChangesAsync(); // Save the reply

                // Add reply to the parent's Kids list
                parentComment.Kids.Add(reply);

                _context.Comments.Update(parentComment); // Update the parent comment/reply
                await _context.SaveChangesAsync(); // Save the parent comment/reply
            }
            else
            {
                // Handle cases where the parent comment isn't found (e.g. should throw error)
                throw new Exception($"Parent comment with ID {reply.CommentId} not found.");
            }
        }



        // Update a comment
        public async Task UpdateCommentAsync(Comment comment)
        {
            _context.Comments.Update(comment);
            await _context.SaveChangesAsync();
        }

        // Update a reply
        public async Task UpdateReplyAsync(Comment reply)
        {
            _context.Comments.Update(reply);
            await _context.SaveChangesAsync();
        }

        // Get comments by parent ID
        public async Task<IEnumerable<Comment>> GetCommentsByParentIdAsync(long parentId)
        {
            return await _context.Comments
                .Where(c => c.StoryId == parentId && c.CommentId == null)
                .Include(c => c.Kids)
                .ToListAsync();
        }

        // Get replies by parent ID
        public async Task<IEnumerable<Comment>> GetRepliesByParentIdAsync(long parentId)
        {
            return await _context.Comments
                .Where(c => c.CommentId == parentId)
                .Include (c => c.Kids)
                .ToListAsync(); // No need to include Kids here as they are IDs, not Comment objects
        }

        public async Task<Comment> GetLastInsertedCommentAsync()
        {
            return await _context.Comments.OrderByDescending(s => s.Id).FirstOrDefaultAsync();
        }

    }
}
