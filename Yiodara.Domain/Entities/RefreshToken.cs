using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yiodara.Domain.Entities
{
    public class RefreshToken : EntityBase
    {
        private RefreshToken() { }

        public string UserId { get; set; }

        public User User { get; set; }

        public string Token { get; set; }

        public DateTime ExpirationDate { get; set; }

        public bool IsRevoked { get; set; }

        public static RefreshToken Create(string UserId, string refreshToken, DateTime expiration) => new()
        {
            UserId = UserId,
            ExpirationDate = expiration,
            Token = refreshToken
        };
    }
}
