using HackerNewsApi.Services;
using HackerNews.DataAccess.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using HackerNewsApi.Services.ServicesInterfaces;

namespace HackerNewsApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        private readonly ICommentService _commentService;
        private readonly IStoryService _storyService; // Service for stories

        public CommentController(ICommentService commentService, IStoryService storyService)
        {
            _commentService = commentService;
            _storyService = storyService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Comment>>> GetAllComments()
        {
            var comments = await _commentService.GetAllCommentsAsync();
            return Ok(comments);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Comment>> GetComment(long id)
        {
            var comment = await _commentService.GetCommentByIdAsync(id);
            if (comment == null)
            {
                return NotFound();
            }
            return Ok(comment);
        }

        [HttpPost]
        public async Task<ActionResult<Comment>> CreateComment(Comment comment)
        {
            try
            {
                // Add the new comment
                var createdComment = await _commentService.AddCommentAsync(comment);

                // Check if there is a parent comment or story
                if (comment.ParentId != null)
                {
                    // Check if the parent is a story
                    var parentStory = await _storyService.GetStoryByIdAsync(comment.ParentId.Value);

                    if (parentStory != null)
                    {
                        // Initialize Kids if null
                        parentStory.Kids ??= new List<Comment>();

                        // Add the new comment to the story's Kids list
                        parentStory.Kids.Add(createdComment);

                        // Increment the descendants field
                        parentStory.Descendants = (parentStory.Descendants ?? 0) + 1;

                        // Save updates to the story
                        await _storyService.UpdateStoryAsync(parentStory);
                    }
                    else
                    {
                        // If not a story, check if the parent is a comment
                        var parentComment = await _commentService.GetCommentByIdAsync(comment.ParentId.Value);

                        if (parentComment == null)
                        {
                            return NotFound($"Parent with ID {comment.ParentId} not found.");
                        }

                        // Initialize Kids if null
                        parentComment.Kids ??= new List<Comment>();

                        // Add the new comment to the parent's Kids list
                        parentComment.Kids.Add(createdComment);

                        // Save updates to the comment
                        await _commentService.UpdateCommentAsync(parentComment);
                    }
                }

                return CreatedAtAction(nameof(GetComment), new { id = createdComment.Id }, createdComment);
            }
            catch (Exception ex)
            {
                // Log the exception details (e.g., to a file or logging system)
                Console.Error.WriteLine(ex);

                // Return a 500 status code with a message
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

    }
}
