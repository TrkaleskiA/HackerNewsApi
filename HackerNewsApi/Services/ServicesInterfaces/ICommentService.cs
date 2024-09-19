using HackerNews.DataAccess.Entities;
using HackerNewsApi.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HackerNewsApi.Services.ServicesInterfaces
{
    public interface ICommentService
    {
        // Comment-specific methods
        Task<Comment> GetCommentByIdAsync(long id);
        Task<IEnumerable<Comment>> GetAllCommentsAsync();
        Task<Comment> AddCommentAsync(Comment comment);
        Task UpdateCommentAsync(Comment comment);
        Task<IEnumerable<Comment>> GetCommentsByParentIdAsync(long parentId);

        // Reply-specific methods
        Task<Comment> GetReplyByIdAsync(long id);
        Task<IEnumerable<Comment>> GetAllRepliesAsync();
        Task UpdateReplyAsync(Comment reply);
        Task<IEnumerable<Comment>> GetRepliesByParentIdAsync(long commentId);
        Task<Comment>AddReplyAsync(CommentDto replyDto);
        Task<Comment> GetLastInsertedCommentAsync();
    }
}
