using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yiodara.Domain.Entities
{
    public class Event : EntityBase
    {
        public string? Title { get;  set; }
        public string? Description { get;  set; }
        public string? Location { get; set; }
        public DateTime EventDate { get; set; }
        public string EventTime { get; set; }
        public string? CoverImageUrl { get; set; }
        public List<string> OtherImageUrls { get; set; }


        private Event()
        {
            OtherImageUrls = new List<string>();
        }

        public static Event Create(
            string title,
            string description,
            string location,
            DateTime eventDate,
            string eventTime,
            string coverImageUrl,
            List<string> otherImageUrls)
        {
            var eventEntity = new Event
            {
                Id = Guid.NewGuid(),
                Title = title.Trim(),
                Description = description.Trim(),
                Location = location.Trim(),
                EventDate = eventDate,
                EventTime = eventTime,
                CoverImageUrl = coverImageUrl,
                OtherImageUrls = otherImageUrls ?? new List<string>(),
                Created = DateTime.UtcNow,
                IsDeleted = false
            };

            return eventEntity;
        }

        public void SoftDelete()
        {
            IsDeleted = true;
            LastModified = DateTime.UtcNow;
        }
    }
}
