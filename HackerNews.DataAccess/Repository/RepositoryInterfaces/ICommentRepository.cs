using HackerNews.DataAccess.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HackerNews.DataAccess.Repository.RepositoryInterfaces
{
    public interface ICommentRepository
    {
        Task<Comment> GetCommentByIdAsync(long id);
        Task<IEnumerable<Comment>> GetAllCommentsAsync();
        Task AddCommentAsync(Comment comment);
        Task UpdateCommentAsync(Comment comment); // New method to update a comment
    }
}
