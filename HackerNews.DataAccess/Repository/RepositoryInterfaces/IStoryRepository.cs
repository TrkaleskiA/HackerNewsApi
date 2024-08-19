using HackerNews.DataAccess.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HackerNews.DataAccess.Repository.RepositoryInterfaces
{
    public interface IStoryRepository
    {
        Task<Story> GetStoryByIdAsync(long id);
        Task<IEnumerable<Story>> GetAllStoriesAsync();
        Task AddStoryAsync(Story story);
        Task UpdateStoryAsync(Story story);
    }
}