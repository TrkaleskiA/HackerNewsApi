using HackerNews.DataAccess.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HackerNewsApi.Services.ServicesInterfaces
{
    public interface IStoryService
    {
        Task<Story> GetStoryByIdAsync(long id);
        Task<IEnumerable<Story>> GetAllStoriesAsync();
        Task AddStoryAsync(Story story);
    }
}
