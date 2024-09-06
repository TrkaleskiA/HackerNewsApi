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
                Kids = comment.Kids?.Select(k => k.Id).ToList()
            };
        }

        // Map a list of comments to a list of CommentDto
        private IEnumerable<CommentDto> MapCommentsToDto(IEnumerable<Comment> comments)
        {
            return comments.Select(comment => MapCommentToDto(comment));
        }

        // Get all comments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CommentDto>>> GetAllComments()
        {
            var comments = await _commentService.GetAllCommentsAsync();
            var commentDtos = MapCommentsToDto(comments);
            return Ok(commentDtos);
        }

        // Get a comment by ID
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

        // Get all replies
        [HttpGet("replies")]
        public async Task<ActionResult<IEnumerable<CommentDto>>> GetAllReplies()
        {
            var replies = await _commentService.GetAllRepliesAsync();
            var replyDtos = MapCommentsToDto(replies);
            return Ok(replyDtos);
        }

        // Get a reply by ID
        [HttpGet("reply/{id}")]
        public async Task<ActionResult<CommentDto>> GetReply(long id)
        {
            var reply = await _commentService.GetReplyByIdAsync(id);
            if (reply == null)
            {
                return NotFound();
            }
            var replyDto = MapCommentToDto(reply);
            return Ok(replyDto);
        }

        // Get comments by parent ID
        [HttpGet("byParentId/{parentId}")]
        public async Task<ActionResult<IEnumerable<CommentDto>>> GetCommentsByParentId(long parentId)
        {
            var comments = await _commentService.GetCommentsByParentIdAsync(parentId);
            if (comments == null || !comments.Any())
            {
                return NotFound($"No comments found for parent ID {parentId}.");
            }
            var commentDtos = MapCommentsToDto(comments);
            return Ok(commentDtos);
        }

        // Get replies by parent ID
[HttpGet("replies/byParentId/{parentId}")]
public async Task<ActionResult<IEnumerable<CommentDto>>> GetRepliesByParentId(long parentId)
{
    var replies = await _commentService.GetRepliesByParentIdAsync(parentId);
    if (replies == null || !replies.Any())
    {
        return NotFound($"No replies found for parent ID {parentId}.");
    }
    var replyDtos = MapCommentsToDto(replies);
    return Ok(replyDtos);
}


        // Create a comment
        [HttpPost]
        public async Task<ActionResult<CommentDto>> CreateComment(Comment comment)
        {
            try
            {
                if (comment.CommentId.HasValue)
                {
                    var parentComment = await _commentService.GetCommentByIdAsync(comment.CommentId.Value);
                    if (parentComment == null)
                    {
                        return NotFound($"Parent comment with ID {comment.CommentId} not found.");
                    }

                    parentComment.Kids ??= new List<Comment>();
                    comment.StoryId = parentComment.StoryId;
                    var createdComment = await _commentService.AddCommentAsync(comment);
                    parentComment.Kids.Add(createdComment);

                    await _commentService.UpdateCommentAsync(parentComment);

                    var parentStory = await _storyService.GetStoryByIdAsync(parentComment.StoryId);
                    if (parentStory != null)
                    {
                        parentStory.Descendants = (parentStory.Descendants ?? 0) + 1;
                        await _storyService.UpdateStoryAsync(parentStory);
                    }
                }
                else if (comment.StoryId > 0)
                {
                    var parentStory = await _storyService.GetStoryByIdAsync(comment.StoryId);
                    if (parentStory != null)
                    {
                        parentStory.Kids ??= new List<Comment>();
                        var createdComment = await _commentService.AddCommentAsync(comment);
                        parentStory.Kids.Add(createdComment);

                        parentStory.Descendants = (parentStory.Descendants ?? 0) + 1;
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

                var createdCommentDto = MapCommentToDto(comment);
                return CreatedAtAction(nameof(GetComment), new { id = createdCommentDto.Id }, createdCommentDto);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("addReply")]
        public async Task<IActionResult> AddReply([FromBody] CommentDto replyDto)
        {
            if (replyDto == null || replyDto.CommentId == null)
            {
                return BadRequest("Reply must have a parent comment or reply");
            }

            try
            {
                // Add the reply
                var createdReply = await _commentService.AddReplyAsync(replyDto);

                // Return the created reply as a DTO
                var replyDtoResult = MapCommentToDto(createdReply);
                return Ok(replyDtoResult);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error adding reply: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }



    }
}
