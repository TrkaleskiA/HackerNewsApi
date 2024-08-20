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
        private readonly IStoryService _storyService;

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
                Comment createdComment;

                if (comment.CommentId.HasValue) // Check if it's a reply
                {
                    var parentComment = await _commentService.GetCommentByIdAsync(comment.CommentId.Value);
                    if (parentComment == null)
                    {
                        return NotFound($"Parent comment with ID {comment.CommentId} not found.");
                    }

                    // Initialize Kids if null
                    parentComment.Kids ??= new List<Comment>();

                    // Add the new comment to the parent's Kids list
                    comment.StoryId = parentComment.StoryId; // Ensure the reply has the correct StoryId
                    createdComment = await _commentService.AddCommentAsync(comment);
                    parentComment.Kids.Add(createdComment);

                    // Save updates to the parent comment
                    await _commentService.UpdateCommentAsync(parentComment);
                }
                else if (comment.StoryId.HasValue) // If it's a story comment
                {
                    var parentStory = await _storyService.GetStoryByIdAsync(comment.StoryId.Value);
                    if (parentStory != null)
                    {
                        // Initialize Kids if null
                        parentStory.Kids ??= new List<Comment>();

                        // Add the new comment to the story's Kids list
                        createdComment = await _commentService.AddCommentAsync(comment);
                        parentStory.Kids.Add(createdComment);

                        // Increment the descendants field
                        parentStory.Descendants = (parentStory.Descendants ?? 0) + 1;

                        // Save updates to the story
                        await _storyService.UpdateStoryAsync(parentStory);
                    }
                    else
                    {
                        return NotFound($"Story with ID {comment.StoryId} not found.");
                    }
                }
                else
                {
                    return BadRequest("Comment must be associated with a story or parent comment.");
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


        [HttpGet("byParentId/{parentId}")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetCommentsByParentId(long parentId)
        {
            var comments = await _commentService.GetCommentsByParentIdAsync(parentId);
            if (comments == null || !comments.Any())
            {
                return NotFound($"No comments found for parent ID {parentId}.");
            }
            return Ok(comments);
        }

    }
}
