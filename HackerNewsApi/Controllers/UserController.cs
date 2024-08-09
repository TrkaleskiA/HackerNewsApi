using System;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HackerNews.DataAccess;
using HackerNews.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using HackerNewsApi.Models;

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

        [HttpPost("register")]
        public async Task<ActionResult<User>> RegisterUser(User user)
        {
            user.Id = Guid.NewGuid();
            user.IsAdmin = false;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
        }


        [HttpPost("login")]
        public async Task<ActionResult<User>> Login([FromBody] LoginModel loginModel)
        {
            // Find the user by username
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == loginModel.Username);

            if (user == null || user.Password != loginModel.Password)
            {
                return Unauthorized("Invalid username or password");
            }

            // Return the user information (excluding the password)
            return Ok(new { user.Id, user.Username, user.Nickname, user.IsAdmin });
        }

        [HttpGet("check-username/{username}")]
        public async Task<ActionResult<bool>> CheckUsernameAvailability(string username)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Username == username);
            return Ok(!userExists); // Returns true if username is available, false otherwise
        }


    }

}
