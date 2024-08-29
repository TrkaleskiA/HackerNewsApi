using HackerNews.DataAccess.Entities;
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

        public async Task UpdateCommentAsync(Comment updatedComment)
        {
            // Fetch the existing comment from the repository
            var existingComment = await _repository.GetCommentByIdAsync(updatedComment.Id);

            if (existingComment != null)
            {
                // Update the relevant fields
                existingComment.Text = updatedComment.Text;
                existingComment.By = updatedComment.By;
                existingComment.Time = updatedComment.Time;

                // Ensure existing Kids are updated by comparing the updatedComment's Kids
                existingComment.Kids = updatedComment.Kids ?? new List<Comment>();

                // Save the changes to the repository
                await _repository.UpdateCommentAsync(existingComment);
            }
        }



        public async Task<IEnumerable<Comment>> GetCommentsByParentIdAsync(long parentId, bool fetchReplies)
        {
            return await _repository.GetCommentsByParentIdAsync(parentId, fetchReplies);
        }
    }
}
