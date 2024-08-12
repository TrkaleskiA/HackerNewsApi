// IUserService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HackerNews.DataAccess.Entities;

namespace HackerNewsApi.Service
{
    public interface IUserService
    {
        Task<User> GetUserByIdAsync(Guid id);
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task RegisterUserAsync(User user);
        Task<User> LoginAsync(string username, string password);
        Task<bool> CheckUsernameAvailabilityAsync(string username);
    }
}
