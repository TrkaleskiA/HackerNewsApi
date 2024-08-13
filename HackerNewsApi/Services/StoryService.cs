using HackerNews.DataAccess.Entities;
using HackerNews.DataAccess.Repository;
using HackerNews.DataAccess.Repository.RepositoryInterfaces;
using HackerNewsApi.Services.ServicesInterfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HackerNewsApi.Services
{
    public class StoryService : IStoryService
    {
        private readonly IStoryRepository _storyRepository;

        public StoryService(IStoryRepository storyRepository)
        {
            _storyRepository = storyRepository;
        }

        public async Task<Story> GetStoryByIdAsync(long id)
        {
            return await _storyRepository.GetStoryByIdAsync(id);
        }

        public async Task<IEnumerable<Story>> GetAllStoriesAsync()
        {
            return await _storyRepository.GetAllStoriesAsync();
        }

        public async Task AddStoryAsync(Story story)
        {
            await _storyRepository.AddStoryAsync(story);
        }
    }
}
