using HackerNewsApi.Services;
using HackerNews.DataAccess.Entities;
using HackerNewsApi.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HackerNewsApi.Services.ServicesInterfaces;
using HackerNewsApi.DTOs;

namespace HackerNewsApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PartController : ControllerBase
    {
        private readonly IPartService _partService;

        public PartController(IPartService partService)
        {
            _partService = partService;
        }

        // GET: api/Part
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PartDto>>> GetAllParts()
        {
            var parts = await _partService.GetAllPartsAsync();
            var partDtos = parts.Select(p => new PartDto
            {
                Id = p.Id,
                Text = p.Text,
                PollId = p.PollId,
                Score = p.Score,
                Time = p.Time,
                By = p.By,
                Type = p.Type
            });
            return Ok(partDtos);
        }

        // GET: api/Part/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PartDto>> GetPart(long id)
        {
            var part = await _partService.GetPartByIdAsync(id);
            if (part == null)
            {
                return NotFound();
            }

            var partDto = new PartDto
            {
                Id = part.Id,
                Text = part.Text,
                PollId = part.PollId,
                Score = part.Score,
                Time = part.Time,
                By = part.By,
                Type = part.Type
            };

            return Ok(partDto);
        }

        // POST: api/Part
        [HttpPost]
        public async Task<ActionResult> CreateParts([FromBody] IEnumerable<PartDto> partDtos)
        {
            if (partDtos == null || !partDtos.Any())
            {
                return BadRequest("Parts data is invalid or empty.");
            }

            var parts = partDtos.Select(dto => new Part
            {
                Text = dto.Text,
                PollId = dto.PollId,
                Score = dto.Score,
                Time = dto.Time,
                By = dto.By,
                Type = dto.Type
            });

            await _partService.AddPartsAsync(parts);
            return Ok();
        }
        // GET: api/Part/byPollId/{pollId}
        [HttpGet("byPollId/{pollId}")]
        public async Task<ActionResult<IEnumerable<PartDto>>> GetPartsByPollId(long pollId)
        {
            var parts = await _partService.GetPartsByPollIdAsync(pollId);
            if (parts == null || !parts.Any())
            {
                return NotFound("No parts found for the given poll ID.");
            }

            var partDtos = parts.Select(p => new PartDto
            {
                Id = p.Id,
                Text = p.Text,
                PollId = p.PollId,
                Score = p.Score,
                Time = p.Time,
                By = p.By,
                Type = p.Type
            });

            return Ok(partDtos);
        }


        // PUT: api/Part/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePart(long id, [FromBody] PartDto partDto)
        {
            if (id != partDto.Id)
            {
                return BadRequest();
            }

            var part = new Part
            {
                Id = partDto.Id,
                Text = partDto.Text,
                PollId = partDto.PollId,
                Score = partDto.Score,
                Time = partDto.Time,
                By = partDto.By,
                Type = partDto.Type
            };

            await _partService.UpdatePartAsync(part);
            return NoContent();
        }

        // DELETE: api/Part/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePart(long id)
        {
            await _partService.DeletePartAsync(id);
            return NoContent();
        }
    }
}
