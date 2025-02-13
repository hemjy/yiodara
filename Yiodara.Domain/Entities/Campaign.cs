using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yiodara.Domain.Entities
{
    public class Campaign : EntityBase
    {
        public Campaign()
        {
        }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public Guid CampaignCategoryId { get; set; }
        public string? Currency { get; set; }
        public double Amount { get; set; }
        public bool IsCompleted { get; set; } = false;
        public virtual CampaignCategory CampaignCategory { get; set; }

        public virtual ICollection<CampaignImage> CampaignImages { get; set; } = new HashSet<CampaignImage>();

        public static Campaign Create(string title, string description, Guid campaignCategoryId,
            string currency, double amount)
            => new()
            {
                Title = title,
                Description = description,
                CampaignCategoryId = campaignCategoryId,
                Currency = currency,
                Amount = amount
            };
    }
}
