using HackerNews.DataAccess;
using HackerNewsApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HackerNewsApi.Controllers
{
    public class AccountController : Controller
    {

        private readonly ApplicationDbContext _context;

        public AccountController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }


        [HttpPost]
        public async Task<IActionResult> Login(LoginModel model)
        {
            if (ModelState.IsValid)
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == model.Username);

                if (user == null || user.Password != model.Password)
                {
                    ModelState.AddModelError(string.Empty, "Invalid username or password");
                    return View(model);
                }

                // Handle successful login (e.g., set authentication cookie, redirect, etc.)
                return RedirectToAction("Index", "News");
            }

            return View(model);
        }
    }
}
