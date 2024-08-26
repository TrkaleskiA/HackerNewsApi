using HackerNews.DataAccess.Entities;
using HackerNewsApi.DTOs;
using HackerNewsApi.Services;
using HackerNewsApi.Services.ServicesInterfaces;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HackerNewsApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StoryController : ControllerBase
    {
        private readonly IStoryService _storyService;

        public StoryController(IStoryService storyService)
        {
            _storyService = storyService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StoryDto>> GetStoryById(long id)
        {
            var story = await _storyService.GetStoryByIdAsync(id);

            if (story == null)
            {
                return NotFound();
            }

            var storyDto = new StoryDto
            {
                Id = story.Id,
                Title = story.Title,
                Url = story.Url,
                By = story.By,
                Descendants = story.Descendants,
                Score = story.Score,
                Time = story.Time,
                Type = story.Type,
                Kids = story.Kids?.Select(k => k.Id).ToList(), // Only return IDs of comments
                Parts = story.Parts
            };

            return Ok(storyDto);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StoryDto>>> GetAllStories()
        {
            var stories = await _storyService.GetAllStoriesAsync();
            var storyDtos = stories.Select(story => new StoryDto
            {
                Id = story.Id,
                Title = story.Title,
                Url = story.Url,
                By = story.By,
                Descendants = story.Descendants,
                Score = story.Score,
                Time = story.Time,
                Type = story.Type, 
                Kids = story.Kids?.Select(k => k.Id).ToList(),   // Return only IDs
                Parts= story.Parts
            }).ToList();

            return Ok(storyDtos);
        }


        [HttpPost]
        public async Task<ActionResult> AddStory([FromBody] Story story)
        {
            await _storyService.AddStoryAsync(story);
            return CreatedAtAction(nameof(GetStoryById), new { id = story.Id }, story);
        }

        // New method to handle updates
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStory(long id, [FromBody] Story updatedStory)
        {
            if (id != updatedStory.Id)
            {
                return BadRequest();
            }

            var existingStory = await _storyService.GetStoryByIdAsync(id);
            if (existingStory == null)
            {
                return NotFound();
            }

            await _storyService.UpdateStoryAsync(updatedStory);
            return NoContent(); // Success with no content
        }

        [HttpPost("like/{storyId}")]
        public async Task<IActionResult> LikeStory(long storyId)
        {
            var story = await _storyService.GetStoryByIdAsync(storyId);
            if (story == null)
            {
                return NotFound("Story not found.");
            }

            // Increment the score of the selected option
            story.Score += 1;

            await _storyService.UpdateStoryAsync(story);

            return Ok(story);
        }
    }
}
