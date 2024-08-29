using HackerNewsApi.DTOs;
using HackerNewsApi.Services.ServicesInterfaces;
using HackerNews.DataAccess.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

        // Map a single comment to CommentDto
        private CommentDto MapCommentToDto(Comment comment)
        {
            return new CommentDto
            {
                Id = comment.Id,
                Text = comment.Text,
                By = comment.By,
                StoryId = comment.StoryId,
                CommentId = comment.CommentId,
                Time = comment.Time,
                Type = comment.Type,
                Kids = comment.Kids?.Select(k => k.Id).ToList() // Only return IDs of replies
            };
        }

        // Map a list of comments to a list of CommentDto
        private IEnumerable<CommentDto> MapCommentsToDto(IEnumerable<Comment> comments)
        {
            return comments.Select(comment => MapCommentToDto(comment));
        }

        // Get all comments and return CommentDto
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CommentDto>>> GetAllComments()
        {
            var comments = await _commentService.GetAllCommentsAsync();
            var commentDtos = MapCommentsToDto(comments);
            return Ok(commentDtos);
        }

        // Get a comment by id and return CommentDto
        [HttpGet("{id}")]
        public async Task<ActionResult<CommentDto>> GetComment(long id)
        {
            var comment = await _commentService.GetCommentByIdAsync(id);
            if (comment == null)
            {
                return NotFound();
            }
            var commentDto = MapCommentToDto(comment);
            return Ok(commentDto);
        }

        // Create a comment and return CommentDto
        [HttpPost]
        public async Task<ActionResult<CommentDto>> CreateComment(Comment comment)
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

                    // Add the new reply to the parent's Kids list
                    comment.StoryId = parentComment.StoryId; // Ensure the reply has the correct StoryId
                    createdComment = await _commentService.AddCommentAsync(comment);
                    parentComment.Kids.Add(createdComment);

                    // Save updates to the parent comment
                    await _commentService.UpdateCommentAsync(parentComment);

                    // Increment the descendants field of the story
                    var parentStory = await _storyService.GetStoryByIdAsync(parentComment.StoryId);
                    if (parentStory != null)
                    {
                        parentStory.Descendants = (parentStory.Descendants ?? 0) + 1;
                        await _storyService.UpdateStoryAsync(parentStory);
                    }
                }
                else if (comment.StoryId>0) // If it's a story comment
                {
                    var parentStory = await _storyService.GetStoryByIdAsync(comment.StoryId);
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

                var createdCommentDto = MapCommentToDto(createdComment);
                return CreatedAtAction(nameof(GetComment), new { id = createdCommentDto.Id }, createdCommentDto);
            }
            catch (Exception ex)
            {
                // Log the exception details (e.g., to a file or logging system)
                Console.Error.WriteLine(ex);

                // Return a 500 status code with a message
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Get comments by parent ID and return CommentDto
        [HttpGet("byParentId/{parentId}")]
        public async Task<ActionResult<IEnumerable<CommentDto>>> GetCommentsByParentId(long parentId, [FromQuery] bool fetchReplies = false)
        {
            var comments = await _commentService.GetCommentsByParentIdAsync(parentId, fetchReplies);
            if (comments == null || !comments.Any())
            {
                return NotFound($"No comments found for parent ID {parentId}.");
            }
            var commentDtos = MapCommentsToDto(comments);
            return Ok(commentDtos);
        }
    }
}
