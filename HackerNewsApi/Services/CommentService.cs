using HackerNews.DataAccess.Entities;
using HackerNews.DataAccess.Repository;
using HackerNews.DataAccess.Repository.RepositoryInterfaces;
using HackerNewsApi.DTOs;
using HackerNewsApi.Services.ServicesInterfaces;
using System.Collections.Generic;
using System.Linq;
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

        // Get comment by ID
        public Task<Comment> GetCommentByIdAsync(long id)
        {
            return _repository.GetCommentByIdAsync(id);
        }

        // Get reply by ID
        public Task<Comment> GetReplyByIdAsync(long id)
        {
            return _repository.GetReplyByIdAsync(id);
        }

        // Get all comments
        public Task<IEnumerable<Comment>> GetAllCommentsAsync()
        {
            return _repository.GetAllCommentsAsync();
        }

        // Get all replies
        public Task<IEnumerable<Comment>> GetAllRepliesAsync()
        {
            return _repository.GetAllRepliesAsync();
        }

        // Get comments by parent ID
        public Task<IEnumerable<Comment>> GetCommentsByParentIdAsync(long parentId)
        {
            return _repository.GetCommentsByParentIdAsync(parentId);
        }

        // Get replies by parent ID
        public async Task<IEnumerable<Comment>> GetRepliesByParentIdAsync(long commentId)
        {
            return await _repository.GetRepliesByParentIdAsync(commentId);
        }




        // Add a comment
        public async Task<Comment> AddCommentAsync(Comment comment)
        {
            await _repository.AddCommentAsync(comment);
            return comment;
        }

        // Add a reply
        public async Task<Comment> AddReplyAsync(CommentDto replyDto)
        {
            var reply = new Comment
            {
                Id = replyDto.Id,
                Text = replyDto.Text,
                By = replyDto.By,
                StoryId = replyDto.StoryId,
                CommentId = replyDto.CommentId,  // Links reply to the parent comment or reply
                Time = replyDto.Time,
                Type = replyDto.Type
            };

            try
            {
                await _repository.AddReplyAsync(reply);
                return reply; // Return the created reply
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding reply: {ex.Message}");
                throw;
            }
        }





        // Update a comment
        public async Task UpdateCommentAsync(Comment updatedComment)
        {
            var existingComment = await _repository.GetCommentByIdAsync(updatedComment.Id);

            if (existingComment != null)
            {
                existingComment.Text = updatedComment.Text;
                existingComment.By = updatedComment.By;
                existingComment.Time = updatedComment.Time;

                if (updatedComment.Kids != null)
                {
                    var existingKids = existingComment.Kids.ToDictionary(k => k.Id);
                    foreach (var kid in updatedComment.Kids)
                    {
                        if (existingKids.ContainsKey(kid.Id))
                        {
                            existingKids[kid.Id] = kid;
                        }
                        else
                        {
                            existingComment.Kids.Add(kid);
                        }
                    }

                    existingComment.Kids = existingComment.Kids
                        .Where(k => updatedComment.Kids.Any(uc => uc.Id == k.Id))
                        .ToList();
                }

                await _repository.UpdateCommentAsync(existingComment);
            }
        }

        // Update a reply
        public async Task UpdateReplyAsync(Comment updatedReply)
        {
            var existingReply = await _repository.GetReplyByIdAsync(updatedReply.Id);

            if (existingReply != null)
            {
                existingReply.Text = updatedReply.Text;
                existingReply.By = updatedReply.By;
                existingReply.Time = updatedReply.Time;

                await _repository.UpdateReplyAsync(existingReply);
            }
        }
    }
}
