using HackerNews.DataAccess.Entities;
using HackerNews.DataAccess.Repository.RepositoryInterfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using HackerNewsApi.Services.ServicesInterfaces;
using HackerNews.DataAccess.Entities.Enums;

namespace HackerNewsApi.Services
{
    public class StoryService : IStoryService
    {
        private readonly IStoryRepository _storyRepository;
        private readonly IPartService _partService;

        public StoryService(IStoryRepository storyRepository, IPartService partService)
        {
            _storyRepository = storyRepository;
            _partService = partService;
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

        public async Task AddStoryWithPartsAsync(Story story, IEnumerable<Part> parts)
        {
            if (story.Type == StoryType.poll)
            {
                await _storyRepository.AddStoryAsync(story);
                foreach (var part in parts)
                {
                    part.PollId = story.Id;
                }
                await _partService.AddPartsAsync(parts);
            }
            else
            {
                await _storyRepository.AddStoryAsync(story);
            }
        }

        // Implementation of the update method
        public async Task UpdateStoryAsync(Story story)
        {
            await _storyRepository.UpdateStoryAsync(story);
        }
    }
}
