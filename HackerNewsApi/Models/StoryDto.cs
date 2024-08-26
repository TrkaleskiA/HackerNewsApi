using HackerNews.DataAccess.Entities;
using HackerNews.DataAccess.Entities.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace HackerNewsApi.DTOs
{
    public class StoryDto
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public string Url { get; set; }
        public string By { get; set; }
        public int? Descendants { get; set; }
        public int Score { get; set; }
        public long Time { get; set; }
        public StoryType Type { get; set; }
        public List<long>? Kids { get; set; }  // List of comment IDs
        public List<Part>? Parts { get; set; }
        [NotMapped]
        public bool ShouldHaveParts => Type == StoryType.poll;

    }

}
