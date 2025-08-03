using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Yiodara.Application.Interfaces.Auth;

namespace Yiodara.Infrastructure.Identity
{
    public class JwtTokenGenerator : IJwtTokenGenerator
    {
        private readonly IConfiguration _configuration;

        public JwtTokenGenerator(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public (string token, string refreshToken, DateTime refreshTokenExp) GenerateJwtTokenInfo(Guid userId, string username, List<string> roles)
        {
            // Convert GUID to string for claims
            var userIdString = userId.ToString();

            // Define claims for the JWT token
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Email, username),
                new Claim(ClaimTypes.NameIdentifier, userIdString), // Use NameIdentifier (PrimarySid) for user ID
                new Claim(JwtRegisteredClaimNames.Sub, userIdString), // Subject: typically user ID or username
                new Claim(JwtRegisteredClaimNames.Iat, ((DateTimeOffset)DateTime.UtcNow).ToUnixTimeSeconds().ToString(), ClaimValueTypes.String) // Issued At
            };

            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            // Secret key for signing the token (retrieved from configuration)
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Get token expiration time
            var expirationTime = GetAccessTokenExpiration();

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
            // Generate a refresh token as a random string
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

        // Helper method to extract GUID from JWT token claims
        public static Guid GetUserIdFromClaims(ClaimsPrincipal principal)
        {
            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new InvalidOperationException("Invalid or missing user ID in token claims");
            }

            return userId;
        }
    }
}