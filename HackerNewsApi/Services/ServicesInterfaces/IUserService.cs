// IUserService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HackerNews.DataAccess.Entities;

namespace HackerNewsApi.Services.ServicesInterfaces
{
    public interface IUserService
    {
        Task<User> GetUserByIdAsync(Guid id);
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task RegisterUserAsync(User user);
        Task<User> LoginAsync(string username, string password);
        Task<bool> CheckUsernameAvailabilityAsync(string username);
        Task<List<long>> GetVotedPollsAsync(Guid userId);
        Task UpdateUserAsync(User user);
    }
}
