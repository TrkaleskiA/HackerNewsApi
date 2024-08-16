using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HackerNews.DataAccess.Entities
{
    public class Part
    {
        [Key]
        public long Id { get; set; }

        [Required]
        public string Text { get; set; }

        [Required]
        public long PollId { get; set; }  // Foreign key to the poll

        [JsonIgnore]
        [ForeignKey(nameof(PollId))]
        public Story Poll { get; set; }  // Navigation property

        public int Score { get; set; }

        public long Time { get; set; }

        [Required]
        public string By { get; set; }

        [Required]
        public string Type { get; set; } = "pollopt";
    }
}
