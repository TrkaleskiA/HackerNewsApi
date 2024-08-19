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
            return await _context.Set<Comment>().FindAsync(id);
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
    }
}
