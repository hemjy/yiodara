using Microsoft.AspNetCore.Identity;

namespace Yiodara.Domain.Entities
{
    public class User : IdentityUser<Guid>
    {
        public string? FullName { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? CurrencySymbol{ get; set; }
        public string? CurrencyCode { get; set; }
        public string? CountryCode { get; set; }
        public string? CountryFlag { get; set; }

        // Navigation properties for EventVolunteers
        public virtual ICollection<EventVolunteers> EventVolunteers { get; set; } = new List<EventVolunteers>();

        // Helper property to get user's events directly
        public IEnumerable<Event?> Events => EventVolunteers
            .Where(ev => !ev.IsDeleted)
            .Select(ev => ev.Event)
            .Where(e => e != null);

        public string? CreatedBy { get; set; }
        public string? ModifiedBy { get; set; }
        public bool Modified { get; set; }
        public DateTime Created { get; set; } = DateTime.UtcNow;
        public DateTime? LastModified { get; set; }
        public bool IsDeleted { get; set; } = false;

    }
}
