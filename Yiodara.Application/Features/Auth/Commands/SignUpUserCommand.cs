using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Serilog;
using System.ComponentModel.DataAnnotations;
using Yiodara.Application.Common;
using Yiodara.Application.DTOs;
using Yiodara.Application.Interfaces.Auth;
using Yiodara.Domain.Entities;

namespace Yiodara.Application.Features.Auth.Commands
{
    public class SignUpUserCommand : IRequest<Result<SignUpResponseDto>>
    {
        [Required(ErrorMessage = "Full name is required.")]
        [StringLength(50, ErrorMessage = "Full name cannot be longer than 50 characters.")]
        public string? FullName { get; set; }

        [StringLength(50, ErrorMessage = "User name cannot be longer than 50 characters.")]
        public string? UserName { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string? Email { get; set; }

        public string? Password { get; set; }

        [StringLength(10, ErrorMessage = "User role cannot be longer than 10 characters.")]
        public string? Role { get; set; } = "Donor";
    }

    public class SignUpCommandHandler : IRequestHandler<SignUpUserCommand, Result<SignUpResponseDto>>
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger _logger;
        private readonly IJwtTokenGenerator _jwtToken;

        public SignUpCommandHandler(
            UserManager<User> userManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration,
            ILogger logger,
            IJwtTokenGenerator jwtTokenGenerator)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _logger = logger;
            _jwtToken = jwtTokenGenerator;
        }

        public async Task<Result<SignUpResponseDto>> Handle(SignUpUserCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling signup request for email: {Email}", request.Email);

                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);

                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);


                if (!isValid)
                {
                    _logger.Warning("Validation failed for /signup request: {ValidationResults}", validationResults);
                    return Result<SignUpResponseDto>.Failure("failed", validationResults);
                }

                // Validate password complexity
                var passwordValidator = new PasswordValidator<User>();
                var passwordValidationResult = await passwordValidator.ValidateAsync(_userManager, null, request.Password);
                if (!passwordValidationResult.Succeeded)
                {
                    var errors = passwordValidationResult.Errors
                        .Select(e => e.Description)
                        .ToList();
                    return Result<SignUpResponseDto>.Failure("Password validation failed", errors);
                }

                var existingUser = await _userManager.FindByEmailAsync(request.Email);
                if (existingUser != null)
                    return Result<SignUpResponseDto>.Failure("User with this email already exists");

                if (!await _roleManager.RoleExistsAsync(request.Role))
                {
                    await _roleManager.CreateAsync(new IdentityRole(request.Role));
                }

                var user = new User
                {
                    FullName = request.FullName,
                    UserName = request.Email,
                    Email = request.Email
                };

                var createResult = await _userManager.CreateAsync(user, request.Password);

                if (!createResult.Succeeded)
                {
                    var errors = createResult.Errors
                        .Select(e => e.Description)
                        .ToList();
                    return Result<SignUpResponseDto>.Failure("User creation failed", errors);
                }

                await _userManager.AddToRoleAsync(user, request.Role);

                var token = _jwtToken.GenerateJwtTokenInfo(user.Id, user.UserName ?? "", new List<string> { request.Role});

                SignUpResponseDto? signUpResponseDtoauthDto = new SignUpResponseDto
                {
                    Token = token.token,
                    RefreshToken = token.refreshToken,
                    RefreshTokenExpiry = token.refreshTokenExp,
                    Email = user.Email,
                    Role = request.Role
                };

                return Result<SignUpResponseDto>.Success(signUpResponseDtoauthDto, "User registered successfully");
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during user signup");
                return Result<SignUpResponseDto>.Failure($"An unexpected error occurred: {ex.Message}");
            
            }
        }
    }
}