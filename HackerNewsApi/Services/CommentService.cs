using HackerNews.DataAccess.Entities;
using HackerNews.DataAccess.Repository;
using HackerNews.DataAccess.Repository.RepositoryInterfaces;
using HackerNewsApi.Services.ServicesInterfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HackerNewsApi.Services
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _repository;

        public CommentService(ICommentRepository repository)
        {
            _repository = repository;
        }

        public Task<Comment> GetCommentByIdAsync(long id)
        {
            return _repository.GetCommentByIdAsync(id);
        }

        public Task<IEnumerable<Comment>> GetAllCommentsAsync()
        {
            return _repository.GetAllCommentsAsync();
        }

        public async Task<Comment> AddCommentAsync(Comment comment)
        {
            await _repository.AddCommentAsync(comment);
            return comment;
        }

        public Task UpdateCommentAsync(Comment comment)
        {
            return _repository.UpdateCommentAsync(comment);
        }

        public async Task<IEnumerable<Comment>> GetCommentsByParentIdAsync(long parentId, bool fetchReplies)
        {
            return await _repository.GetCommentsByParentIdAsync(parentId, fetchReplies);
        }
    }
}
