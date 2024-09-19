using HackerNews.DataAccess.Entities;
using HackerNews.DataAccess.Repository.RepositoryInterfaces;
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
        private readonly IStoryRepository _storyRepository;

        public StoryController(IStoryService storyService, IStoryRepository storyRepository)
        {
            _storyService = storyService;
            _storyRepository = storyRepository;
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
        public async Task<ActionResult> AddStory([FromBody] StoryDto storyDto)
        {
            var story = new Story
            {
                Id = storyDto.Id,
                Title = storyDto.Title,
                Url = storyDto.Url,
                By = storyDto.By,
                Descendants = storyDto.Descendants,
                Score = storyDto.Score,
                Time = storyDto.Time,
                Type = storyDto.Type,
                Kids = storyDto.Kids != null
            ? storyDto.Kids.Select(id => new Comment { Id = id }).ToList()
            : new List<Comment>(),
                Parts = storyDto.Parts?.Select(p => new Part { Id = p.Id, /* other properties */ }).ToList() // Map poll parts if needed
            };
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

       /* [HttpPost("like/{storyId}")]
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
        }*/

        [HttpPost("like")]
        public async  Task<IActionResult> LikeStory([FromForm] string userId, [FromForm] string storyId)
        {
            /*Guid user = new Guid(userId);
            long story = long.Parse(storyId);
            _storyService.LikeOrUnlikeStoryAsync(user, story);
            return Ok();*/
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(storyId))
            {
                return BadRequest("Invalid userId or storyId.");
            }

            Guid userGuid;
            if (!Guid.TryParse(userId, out userGuid))
            {
                return BadRequest("Invalid userId format.");
            }

            long storyLong;
            if (!long.TryParse(storyId, out storyLong))
            {
                return BadRequest("Invalid storyId format.");
            }

            await _storyService.LikeOrUnlikeStoryAsync(userGuid, storyLong);
            return Ok();
        }

        [HttpGet("likedstories/{userId}")]
        public async Task<IActionResult> GetLikedStories(Guid userId)
        {
            try
            {
                var likedStories = await _storyService.GetLikedStoriesAsync(userId);
                return Ok(likedStories);
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpPost("star")]
        public async Task<IActionResult> StarStory([FromForm] string userId, [FromForm] string storyId)
        {
            /*Guid user = new Guid(userId);
            long story = long.Parse(storyId);
            _storyService.LikeOrUnlikeStoryAsync(user, story);
            return Ok();*/
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(storyId))
            {
                return BadRequest("Invalid userId or storyId.");
            }

            Guid userGuid;
            if (!Guid.TryParse(userId, out userGuid))
            {
                return BadRequest("Invalid userId format.");
            }

            long storyLong;
            if (!long.TryParse(storyId, out storyLong))
            {
                return BadRequest("Invalid storyId format.");
            }

            await _storyService.StarOrUnstarStoryAsync(userGuid, storyLong);
            return Ok();
        }

        [HttpGet("starredstories/{userId}")]
        public async Task<IActionResult> GetStarredStories(Guid userId)
        {
            try
            {
                var starredStories = await _storyService.GetStarredStoriesAsync(userId);
                return Ok(starredStories);
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("fetchstories")]
        public async Task<ActionResult> FetchStory([FromBody] StoryDto storyDto)
        {
            var story = new Story
            {
                Id = storyDto.Id,
                Title = storyDto.Title,
                Url = storyDto.Url,
                By = storyDto.By,
                Descendants = storyDto.Descendants,
                Score = storyDto.Score,
                Time = storyDto.Time,
                Type = storyDto.Type,
                Kids = storyDto.Kids != null
            ? storyDto.Kids.Select(id => new Comment { Id = id }).ToList()
            : new List<Comment>(),
                Parts = storyDto.Parts?.Select(p => new Part { Id = p.Id, /* other properties */ }).ToList() // Map poll parts if needed
            };
            await _storyService.AddStoryAsync(story);
            return CreatedAtAction(nameof(GetStoryById), new { id = story.Id }, story);
        }

        [HttpGet("getlaststory")]
        public async Task<ActionResult<long>> GetLastStoryId()
        {
            var lastStory = await _storyService.GetLastInsertedStoryAsync();

            if (lastStory == null)
            {
                return NotFound("No stories found.");
            }

            return Ok(lastStory.Id);
        }
    }
}
