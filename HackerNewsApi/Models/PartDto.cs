using System.ComponentModel.DataAnnotations;

namespace HackerNewsApi.DTOs
{
    public class PartDto
    {
        public long Id { get; set; }  // This is used for updating or retrieving specific parts

        [Required]
        public string Text { get; set; }  // The main content of the part

        [Required]
        public long PollId { get; set; }  // Foreign key reference to the poll

        public int Score { get; set; }  // Score, can be optional or defaulted

        public long Time { get; set; }  // Unix time, should be set automatically

        [Required]
        public string By { get; set; }  // User creating the part

        [Required]
        public string Type { get; set; }  // "pollopt" or any other types as per your business logic
    }
}
