using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Serilog;
using System.ComponentModel.DataAnnotations;
using Yiodara.Application.Common;
using Yiodara.Application.DTOs;
using Yiodara.Application.Features.Country.Query;
using Yiodara.Application.Interfaces.Auth;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;

namespace Yiodara.Application.Features.Auth.Commands
{
    public class SignUpVolunteerCommand : IRequest<Result<SignUpResponseDto>>
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

        public string? CountryCode { get; set; }

        [StringLength(10, ErrorMessage = "User role cannot be longer than 10 characters.")]
        public string? Role { get; set; } = "Volunteer";
    }

    public class SignUpVolunteerCommandHandler : IRequestHandler<SignUpVolunteerCommand, Result<SignUpResponseDto>>
    {
        private readonly UserManager<Domain.Entities.User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger _logger;
        private readonly IJwtTokenGenerator _jwtToken;
        private readonly IMediator _mediator;
        private readonly IGenericRepositoryAsync<Domain.Entities.VolunteerCountry> _volunteerCountry;


        public SignUpVolunteerCommandHandler(
            UserManager<Domain.Entities.User> userManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration,
            ILogger logger,
            IJwtTokenGenerator jwtTokenGenerator,
            IMediator mediator,
             IGenericRepositoryAsync<Domain.Entities.VolunteerCountry> volunteerCountry)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _logger = logger;
            _jwtToken = jwtTokenGenerator;
            _mediator = mediator;
            _volunteerCountry = volunteerCountry;
        }

        public async Task<Result<SignUpResponseDto>> Handle(SignUpVolunteerCommand request, CancellationToken cancellationToken)
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

                var countryResult = await _mediator.Send(new GetCountryByCodeQuery { CountryCode = request.CountryCode }, cancellationToken);
                if (!countryResult.Succeeded)
                {
                    return Result<SignUpResponseDto>.Failure(countryResult.Message);
                }

                // Validate password complexity
                var passwordValidator = new PasswordValidator<Domain.Entities.User>();
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

                var user = new Domain.Entities.User
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

                var token = _jwtToken.GenerateJwtTokenInfo(user.Id, user.UserName ?? "", new List<string> { request.Role });

                var country = new VolunteerCountry
                {
                    UserId = user.Id,
                    CountryName = countryResult.Data.Name,
                    Code = countryResult.Data.Code
                };

                await _volunteerCountry.AddAsync(country);

                SignUpResponseDto? signUpResponseDtoauthDto = new SignUpResponseDto
                {
                    Token = token.token,
                    RefreshToken = token.refreshToken,
                    RefreshTokenExpiry = token.refreshTokenExp,
                    Email = user.Email,
                    Role = request.Role,
                    UserId = user.Id,
                    FullName = user.FullName
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