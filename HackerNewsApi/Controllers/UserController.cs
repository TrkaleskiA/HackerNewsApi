// UserController.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using HackerNews.DataAccess.Entities;
using HackerNewsApi.Models;
using HackerNewsApi.Services.ServicesInterfaces;

[Route("[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUserById(Guid id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null)
        {
            return NotFound();
        }
        return Ok(user);
    }

    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
    {
        return Ok(await _userService.GetAllUsersAsync());
    }

    [HttpPost("register")]
    public async Task<ActionResult<User>> RegisterUser(User user)
    {
        await _userService.RegisterUserAsync(user);
        return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
    }

    [HttpPost("login")]
    public async Task<ActionResult<User>> Login([FromBody] LoginModel loginModel)
    {
        var user = await _userService.LoginAsync(loginModel.Username, loginModel.Password);
        if (user == null)
        {
            return Unauthorized("Invalid username or password");
        }
        return Ok(new { user.Id, user.Username, user.Nickname, user.IsAdmin });
    }

    [HttpGet("check-username/{username}")]
    public async Task<ActionResult<bool>> CheckUsernameAvailability(string username)
    {
        var isAvailable = await _userService.CheckUsernameAvailabilityAsync(username);
        return Ok(isAvailable);
    }
}
