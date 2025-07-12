using Microsoft.AspNetCore.Identity;

namespace Yiodara.Domain.Entities
{
    public class User : IdentityUser
    {
        public string? FullName { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? CurrencySymbol{ get; set; }
        public string? CurrencyCode { get; set; }
        public string? CountryCode { get; set; }
        public string? CountryFlag { get; set; }
        
    }
}
