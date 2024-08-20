using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HackerNews.DataAccess.Entities
{
    public class Comment
    {
        [Key]
        public long Id { get; set; } 

        [Required]
        public string Text { get; set; } 

        [Required]
        public string By { get; set; }

        public long? StoryId { get; set; }  // Renamed from ParentId

        public long? CommentId { get; set; }  // This is the actual parent comment if it’s a reply.


        public long Time { get; set; } 

        public string Type { get; set; } = "comment"; 

        public List<Comment>? Kids { get; set; } 

        [ForeignKey("StoryId")]
        [JsonIgnore]
        public Story? Story { get; set; } 
    }
}
