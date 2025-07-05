using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yiodara.Domain.Entities
{
     public class PaymentTransaction : EntityBase
    {
        public PaymentTransaction()
        {
            
        }
        public Guid Id { get; set; }
        public string? ReferenceNo { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public decimal DollarValue { get; set; }
        public string? Status { get; set; }
        public string? ProviderRequest { get; set; }
        public string? ProviderResponse { get; set; }
        public DateTime Date { get; set; }
        public string? UserId { get; set; }
        public Guid CampaignId { get; set; }
        public virtual Campaign Campaign { get; set; }

    }
}
