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

        public Task AddCommentAsync(Comment comment)
        {
            return _repository.AddCommentAsync(comment);
        }
    }
}
