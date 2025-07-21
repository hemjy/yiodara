namespace Yiodara.Domain.Entities
{
    public class Notification : EntityBase
    {
        private Notification()
        {
            
        }
        public string Title { get; set; }
        public string Message { get; set; }
        public bool IsRead { get; set; }

        public static Notification Create(string title, string message) => new() { Title = title, Message = message };
    }
}
