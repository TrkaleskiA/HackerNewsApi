using HackerNews.DataAccess.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HackerNews.DataAccess.Repository.RepositoryInterfaces
{
    public interface IUserRepository
    {
        Task<User> GetByIdAsync(Guid id);
        Task<IEnumerable<User>> GetAllAsync();
        Task AddAsync(User user);
        Task<User> GetByUsernameAsync(string username);
        Task<bool> UsernameExistsAsync(string username);
        User GetUserById(Guid userId);
        void UpdateUser(User user);
    }
}
