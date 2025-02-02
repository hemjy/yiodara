using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.Interfaces.Auth;
using Yiodara.Domain.Entities;

namespace Yiodara.Infrastructure.Identity
{
    public class JwtTokenGenerator : IJwtTokenGenerator
    {
        private readonly IConfiguration _configuration;

        public JwtTokenGenerator(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public (string token, string refreshToken, DateTime refreshTokenExp) GenerateJwtTokenInfo(string userId, string username, string role)
        {
            // Define claims for the JWT token
            var claims = new[]
            {
        new Claim(ClaimTypes.Name, username),
        new Claim(ClaimTypes.Email, username),
        new Claim(ClaimTypes.NameIdentifier, userId), // Use NameIdentifier (PrimarySid) for user ID
        new Claim(ClaimTypes.Role, role),
        new Claim(JwtRegisteredClaimNames.Sub, userId), // Subject: typically user ID or username
        new Claim(JwtRegisteredClaimNames.Iat, ((DateTimeOffset)DateTime.UtcNow).ToUnixTimeSeconds().ToString(), ClaimValueTypes.String) // Issued At
    };

            // Secret key for signing the token (retrieved from configuration)
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Get token expiration time (you can define this in your method)
            var expirationTime = DateTime.UtcNow.AddHours(1); // Example: token expires in 1 hour

            // Create the JWT token
            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: expirationTime,
                signingCredentials: creds
            );

            // Return the generated JWT token, refresh token, and refresh token expiration
            return (new JwtSecurityTokenHandler().WriteToken(token), GenerateRefreshToken(), GetRefreshTokenExpiration());
        }

        public string GenerateRefreshToken()
        {
            // You can generate a refresh token as a random string
            var randomNumber = new byte[32];
            using (var rng = new System.Security.Cryptography.RNGCryptoServiceProvider())
            {
                rng.GetBytes(randomNumber);
            }
            return Convert.ToBase64String(randomNumber);
        }

        private DateTime GetAccessTokenExpiration()
        {
            var accessTokenExpirationMinutes = int.Parse(_configuration["JwtSettings:AccessTokenExpirationMinutes"]);
            return DateTime.UtcNow.AddMinutes(accessTokenExpirationMinutes);
        }
        private DateTime GetRefreshTokenExpiration()
        {
            var refreshTokenExpirationDays = int.Parse(_configuration["JwtSettings:RefreshTokenExpirationDays"]);
            return DateTime.UtcNow.AddDays(refreshTokenExpirationDays);
        }

    }
}
