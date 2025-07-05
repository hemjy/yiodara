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
    public class LoginUserCommand : IRequest<Result<LoginResponseDto>>
    {

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string? Email { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        public string? Password { get; set; }
    }

    public class LoginUserCommandHandler : IRequestHandler<LoginUserCommand, Result<LoginResponseDto>>
    {
        private readonly UserManager<Domain.Entities.User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger _logger;
        private readonly IJwtTokenGenerator _jwtToken;
        private readonly IGenericRepositoryAsync<RefreshToken> _refreshTokenRepo;

        public LoginUserCommandHandler(
            UserManager<Domain.Entities.User> userManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration,
            ILogger logger,
            IJwtTokenGenerator jwtTokenGenerator,
            IGenericRepositoryAsync<RefreshToken> refreshTokenRepo)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _logger = logger;
            _jwtToken = jwtTokenGenerator;
            _refreshTokenRepo = refreshTokenRepo;
        }

        public async Task<Result<LoginResponseDto>> Handle(LoginUserCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling login request for email: {Email}", request.Email);

                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);

                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);


                if (!isValid)
                {
                    _logger.Warning("Validation failed for /login request: {ValidationResults}", validationResults);
                    return Result<LoginResponseDto>.Failure("failed", validationResults);
                }


                var user = await _userManager.FindByNameAsync(request.Email.Trim().ToLower());

                if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
                {
                    return Result<LoginResponseDto>.Failure("Invalid credentials");
                }

                var roles = await _userManager.GetRolesAsync(user);
                _logger.Information("User roles: {Roles}", string.Join(", ", roles));

                var (accessToken, refreshToken, refreshTokenExp) = _jwtToken
                                                    .GenerateJwtTokenInfo(user.Id, user.UserName, (List<string>)roles);

                var refreshTokenEntity = RefreshToken.Create(user.Id, refreshToken, refreshTokenExp);

                await _refreshTokenRepo.AddAsync(refreshTokenEntity);

                var loginResponseDto = new LoginResponseDto
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    UserId = user.Id,
                    Email = user.Email,
                    FullName = user.FullName
                };

                return Result<LoginResponseDto>.Success(loginResponseDto, "Login successful");

            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during user login");
                return Result<LoginResponseDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}