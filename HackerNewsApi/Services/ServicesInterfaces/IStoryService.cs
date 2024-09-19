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
        Task AddStoryWithPartsAsync(Story story, IEnumerable<Part> parts);
        Task UpdateDescendantsAsync(long storyId, int increment);

        // New method for updating the story
        Task UpdateStoryAsync(Story story);
        

        Task<List<long>> GetLikedStoriesAsync(Guid userId);
        Task LikeOrUnlikeStoryAsync(Guid userId, long storyId);

        Task<List<long>> GetStarredStoriesAsync(Guid userId);
        Task StarOrUnstarStoryAsync(Guid userId, long storyId);
        Task<Story> GetLastInsertedStoryAsync();
    }
}
