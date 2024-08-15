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
        public async Task<ActionResult> CreateParts([FromBody] IEnumerable<Part> parts)
        {
            if (parts == null || !parts.Any())
            {
                return BadRequest("Parts data is invalid or empty.");
            }

            await _partService.AddPartsAsync(parts);
            return Ok(); // Or return CreatedAtAction if you need to return specific information
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
