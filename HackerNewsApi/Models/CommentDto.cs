namespace HackerNewsApi.DTOs
{
    public class CommentDto
    {
        public long Id { get; set; }
        public string Text { get; set; }
        public string By { get; set; }
        public long? StoryId { get; set; }
        public long? CommentId { get; set; }
        public long Time { get; set; }
        public string Type { get; set; } = "comment";
        public List<long>? Kids { get; set; } // Return only the IDs of replies
    }

}
