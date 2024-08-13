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

        public int Descendants { get; set; } 

        public int Score { get; set; } 

        public long Time { get; set; } 

        public string Type { get; set; } = "story"; 

        public List<Comment>? Kids { get; set; } 
    }
}
