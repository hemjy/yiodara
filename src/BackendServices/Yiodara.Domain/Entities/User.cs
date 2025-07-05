using Microsoft.AspNetCore.Identity;

namespace Yiodara.Domain.Entities
{
    public class User : IdentityUser
    {
        public string? FullName { get; set; }
    }
}
