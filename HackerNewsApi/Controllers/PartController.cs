using HackerNews.Api.Services;
using HackerNews.DataAccess.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HackerNews.Api.Controllers
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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Part>>> GetAllParts()
        {
            var parts = await _partService.GetAllPartsAsync();
            return Ok(parts);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Part>> GetPart(long id)
        {
            var part = await _partService.GetPartByIdAsync(id);
            if (part == null)
            {
                return NotFound();
            }
            return Ok(part);
        }

        [HttpPost]
        public async Task<ActionResult> CreateParts(IEnumerable<Part> parts)
        {
            await _partService.AddPartsAsync(parts);
            return CreatedAtAction(nameof(GetPart), new { id = parts }, parts);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePart(long id, Part part)
        {
            if (id != part.Id)
            {
                return BadRequest();
            }

            await _partService.UpdatePartAsync(part);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePart(long id)
        {
            await _partService.DeletePartAsync(id);
            return NoContent();
        }
    }
}
