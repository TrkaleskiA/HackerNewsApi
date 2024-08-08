using Microsoft.AspNetCore.Mvc;

namespace HackerNewsApi.Controllers
{
    public class NewsController : Controller
    {
        [HttpGet("hackernews")]
        public IActionResult Index()
        {
            return File("/hackernews/index.html", "text/html");
        }
    }
}