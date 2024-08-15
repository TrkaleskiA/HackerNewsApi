using HackerNews.DataAccess.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HackerNewsApi.Services.ServicesInterfaces
{
    public interface ICommentService
    {
        Task<Comment> GetCommentByIdAsync(long id);
        Task<IEnumerable<Comment>> GetAllCommentsAsync();
        Task AddCommentAsync(Comment comment);
    }
}