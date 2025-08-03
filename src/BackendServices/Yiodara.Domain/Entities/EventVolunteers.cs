using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yiodara.Domain.Entities
{
    public class EventVolunteers : EntityBase
    {
        public Guid EventId { get; set; } 
        public Guid VolunteerId { get; set; } 

        // Navigation properties
        public virtual Event? Event { get; set; }
        public virtual User? Volunteer { get; set; }
    }
}
