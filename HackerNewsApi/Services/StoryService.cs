using HackerNews.DataAccess.Entities;
using HackerNews.DataAccess.Repository.RepositoryInterfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using HackerNewsApi.Services.ServicesInterfaces;
using HackerNews.DataAccess.Entities.Enums;
using HackerNews.DataAccess.Repository;

namespace HackerNewsApi.Services
{
    public class StoryService : IStoryService
    {
        private readonly IStoryRepository _storyRepository;
        private readonly IPartService _partService;
        private readonly IUserRepository _userRepository;

        public StoryService(IStoryRepository storyRepository, IPartService partService, IUserRepository userRepository)
        {
            _storyRepository = storyRepository;
            _partService = partService;
            _userRepository = userRepository;
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
        public async Task UpdateDescendantsAsync(long storyId, int increment)
        {
            var story = await _storyRepository.GetStoryByIdAsync(storyId);
            if (story != null)
            {
                story.Descendants = (story.Descendants ?? 0) + increment;
                await _storyRepository.UpdateStoryAsync(story);
            }
            else
            {
                throw new Exception($"Story with ID {storyId} not found.");
            }
        }


        // Implementation of the update method
        public async Task UpdateStoryAsync(Story story)
        {
            await _storyRepository.UpdateStoryAsync(story);
        }
        public async Task LikeOrUnlikeStoryAsync(Guid userId, long storyId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            var story = await _storyRepository.GetStoryByIdAsync(storyId);

            if (user == null)
            {
                throw new Exception("User not found.");
            }

            if (story == null)
            {
                throw new Exception("Story not found.");
            }

            if (user.LikedStoryIds.Contains(storyId))
            {
                // Unlike the story
                user.LikedStoryIds.Remove(storyId);
                story.Score -= 1;
            }
            else
            {
                // Like the story
                user.LikedStoryIds.Add(storyId);
                story.Score += 1;
            }

            await _userRepository.UpdateUserAsync(user);
            await _storyRepository.UpdateStoryAsync(story);
        }


        public async Task<List<long>> GetLikedStoriesAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found.");
            }
            return user.LikedStoryIds;
        }


        public async Task StarOrUnstarStoryAsync(Guid userId, long storyId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            var story = await _storyRepository.GetStoryByIdAsync(storyId);

            if (user == null)
            {
                throw new Exception("User not found.");
            }

            if (story == null)
            {
                throw new Exception("Story not found.");
            }

            if (user.StarredStoryIds.Contains(storyId))
            {
               
                user.StarredStoryIds.Remove(storyId);
                
            }
            else
            {
                
                user.StarredStoryIds.Add(storyId);
                
            }

            await _userRepository.UpdateUserAsync(user);
            
        }


        public async Task<List<long>> GetStarredStoriesAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found.");
            }
            return user.StarredStoryIds;
        }
    }
}
