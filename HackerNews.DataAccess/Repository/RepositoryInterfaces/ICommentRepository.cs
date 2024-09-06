using HackerNews.DataAccess.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HackerNews.DataAccess.Repository.RepositoryInterfaces
{
    public interface ICommentRepository
    {
        Task<Comment> GetCommentByIdAsync(long id);
        Task<Comment> GetReplyByIdAsync(long id);
        Task<IEnumerable<Comment>> GetAllCommentsAsync();
        Task<IEnumerable<Comment>> GetAllRepliesAsync();
        Task<IEnumerable<Comment>> GetCommentsByParentIdAsync(long parentId);
        Task<IEnumerable<Comment>> GetRepliesByParentIdAsync(long parentId);
        Task AddCommentAsync(Comment comment);
        Task AddReplyAsync(Comment reply);
        Task UpdateCommentAsync(Comment comment);
        Task UpdateReplyAsync(Comment reply);
    }
}
