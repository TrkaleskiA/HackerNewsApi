﻿using HackerNews.DataAccess.Entities;
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

        // New method for updating the story
        Task UpdateStoryAsync(Story story);
        //void LikeOrUnlikeStory(Guid userId, long storyId);
        //List<long> GetLikedStories(Guid userId);

        Task<List<long>> GetLikedStoriesAsync(Guid userId);
        Task LikeOrUnlikeStoryAsync(Guid userId, long storyId);
    }
}
