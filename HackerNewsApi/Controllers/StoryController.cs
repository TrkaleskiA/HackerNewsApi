using HackerNews.DataAccess.Entities;
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
        public async Task<ActionResult<Story>> GetStoryById(long id)
        {
            var story = await _storyService.GetStoryByIdAsync(id);

            if (story == null)
            {
                return NotFound();
            }

            return Ok(story);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Story>>> GetAllStories()
        {
            var stories = await _storyService.GetAllStoriesAsync();
            return Ok(stories);
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
    }
}
