using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Serilog;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.DTOs;
using Yiodara.Application.Interfaces.Auth;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;

namespace Yiodara.Application.Features.Auth.Commands
{
    public class RefreshTokenCommand : IRequest<Result<RefreshTokenDto>>
    {
        [Required]
        public string? RefreshToken { get; set; }
    }

    internal class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<RefreshTokenDto>>
    {
        private readonly UserManager<User> _userManager;
        private readonly IGenericRepositoryAsync<RefreshToken> _refreshTokenRepo;
        private readonly IConfiguration _configuration;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly ILogger _logger;

        // Constructor that accepts dependencies
        public RefreshTokenCommandHandler(
            UserManager<User> userManager,
            IConfiguration configuration,
            IJwtTokenGenerator jwtTokenGenerator,
            IGenericRepositoryAsync<RefreshToken> refreshTokenRepo,
            ILogger logger)
        {
            _userManager = userManager;
            _configuration = configuration;
            _jwtTokenGenerator = jwtTokenGenerator;
            _refreshTokenRepo = refreshTokenRepo;
            _logger = logger;
        }

        public async Task<Result<RefreshTokenDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling refresh token request");

                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);

                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);


                if (!isValid)
                {
                    _logger.Warning("Validation failed for refresh token: {ValidationResults}", validationResults);
                    return Result<RefreshTokenDto>.Failure("failed", validationResults);
                }
                var tokenEntity = await _refreshTokenRepo.GetByAsync(t => t.Token == request.RefreshToken && !t.IsRevoked);

                if (tokenEntity == null || tokenEntity.ExpirationDate < DateTime.UtcNow)
                {
                    return Result<RefreshTokenDto>.Failure("Invalid or expired token.");
                }

                var user = await _userManager.FindByIdAsync(tokenEntity.UserId.ToString());

                var roles = await _userManager.GetRolesAsync(user);
                _logger.Information("User roles: {Roles}", string.Join(", ", roles));

                var (accessToken, refreshToken, refreshTokenExp) = _jwtTokenGenerator
                                                                    .GenerateJwtTokenInfo(user.Id, user.UserName, (List<string>)roles);
                // Revoke old refresh token and store the new one
                tokenEntity.IsRevoked = true;

                var refreshTokenEntity = RefreshToken.Create(user.Id, refreshToken, refreshTokenExp);

                await _refreshTokenRepo.AddAsync(refreshTokenEntity, false);
                await _refreshTokenRepo.UpdateAsync(tokenEntity, false);

                var loginResponseDto = new RefreshTokenDto
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                };

                await _refreshTokenRepo.SaveChangesAsync();

                return Result<RefreshTokenDto>.Success(loginResponseDto, "Token refreshed successfully");
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during refresh token");
                return Result<RefreshTokenDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}