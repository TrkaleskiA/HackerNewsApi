﻿using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HackerNews.DataAccess.Entities
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [StringLength(50)] 
        public string Username { get; set; }

        [Required]
        [StringLength(100)] 
        public string Password { get; set; }

        [Required]
        [StringLength(100)] 
        public string? Nickname { get; set; }

        public bool IsAdmin { get; set; }
        public List<long> LikedStoryIds { get; set; } = new List<long>();
        public List<long> PollOptionsVotedIds { get; set; } = new List<long>();

        public List<long> StarredStoryIds { get; set; } = new List<long>();
    }
}
