using System;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HackerNews.DataAccess;
using HackerNews.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace HackerNewsApi.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {

            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUserById(Guid id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()

        {
            return Ok(await _context.Users.ToListAsync());

        }

    }
}
