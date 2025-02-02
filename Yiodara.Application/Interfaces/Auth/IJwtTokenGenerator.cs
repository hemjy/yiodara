using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yiodara.Application.Interfaces.Auth
{
    public interface IJwtTokenGenerator
    {
        (string token, string refreshToken, DateTime refreshTokenExp) GenerateJwtTokenInfo(string userId, string username, string role);
    }
}
