﻿using HackerNews.DataAccess.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HackerNewsApi.Services.ServicesInterfaces
{
    public interface ICommentService
    {
        Task<Comment> GetCommentByIdAsync(long id);
        Task<IEnumerable<Comment>> GetAllCommentsAsync();
        Task<Comment> AddCommentAsync(Comment comment);
        Task UpdateCommentAsync(Comment comment); // New method
        Task<IEnumerable<Comment>> GetCommentsByParentIdAsync(long parentId, bool fetchReplies);
    }
}
