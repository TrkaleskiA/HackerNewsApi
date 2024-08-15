using HackerNews.DataAccess.Entities;
using HackerNews.DataAccess.Repository.RepositoryInterfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using HackerNewsApi.Services;
using HackerNews.DataAccess.Entities.Enums;
using HackerNewsApi.Services.ServicesInterfaces;

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
                // Add the story first
                await _storyRepository.AddStoryAsync(story);

                // Set parts for the story
                foreach (var part in parts)
                {
                    part.PollId = story.Id; // Set the poll ID
                }

                // Add the parts
                await _partService.AddPartsAsync(parts);
            }
            else
            {
                await _storyRepository.AddStoryAsync(story);
            }
        }
    }
}
