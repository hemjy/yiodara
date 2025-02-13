namespace Yiodara.Domain.Entities
{
    public class CampaignImage : EntityBase
    {
        public Guid CampaignId { get; set; }
        public Campaign Campaign { get; set; }
        public bool IsCoverImage { get; set; }
        public string ImageUrl { get; set; }
    }
}
