using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yiodara.Domain.Entities
{
    public class CampaignCategory : EntityBase
    {
        public CampaignCategory()
        {
            Campaigns = new HashSet<Campaign>();
        }

        public string Name { get; set; }

        public virtual ICollection<Campaign> Campaigns { get; set; }

        public static CampaignCategory Create(string name) => new() { Name = name };
    }
}
