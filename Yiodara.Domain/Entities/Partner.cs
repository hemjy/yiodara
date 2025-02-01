using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yiodara.Domain.Entities
{
    public class Partner : EntityBase
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string? CreatedBy { get; set; }
        public string? ModifiedBy { get; set; }
        public DateTime Created { get; set; } = DateTime.UtcNow;
        public DateTime? LastModified { get; set; }
        public bool Modified { get; set; } = false;
        public bool IsDeleted { get; set; }

    }
}
