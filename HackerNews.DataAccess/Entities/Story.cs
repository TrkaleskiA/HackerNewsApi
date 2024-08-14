using HackerNews.DataAccess.Entities.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HackerNews.DataAccess.Entities
{
    public class Story
    {
        [Key]
        public long Id { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Url { get; set; }

        [Required]
        public string By { get; set; }

        public int? Descendants { get; set; }

        public int Score { get; set; }

        public long Time { get; set; }
        [Required]
        public StoryType Type { get; set; }

        public List<Comment>? Kids { get; set; }

        // Navigation property for poll options
        public List<Part>? Parts { get; set; }

        // Custom logic for nullable parts based on the story type
        [NotMapped]
        public bool ShouldHaveParts => Type == StoryType.poll;
    }
}
