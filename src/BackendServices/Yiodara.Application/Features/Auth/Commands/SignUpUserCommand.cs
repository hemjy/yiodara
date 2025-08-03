using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Serilog;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using Yiodara.Application.Common;
using Yiodara.Application.DTOs;
using Yiodara.Application.Helpers;
using Yiodara.Application.Interfaces;
using Yiodara.Application.Interfaces.Auth;
using Yiodara.Application.Validations;
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

        [StringLength(20, MinimumLength = 7, ErrorMessage = "Phone number must be between 7 and 20 characters.")]
        public string? PhoneNumber { get; set; }
    }

    

    public class SignUpCommandHandler : IRequestHandler<SignUpUserCommand, Result<SignUpResponseDto>>
    {
        private readonly UserManager<Domain.Entities.User> _userManager;
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;
        private readonly IUtilityService _utilityService;
        private readonly ILogger _logger;
        private readonly IJwtTokenGenerator _jwtToken;

        public SignUpCommandHandler(
            UserManager<Domain.Entities.User> userManager,
            RoleManager<IdentityRole<Guid>> roleManager,
           IUtilityService utilityService,
            ILogger logger,
            IJwtTokenGenerator jwtTokenGenerator)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _utilityService = utilityService;
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

                // Additional phone number validation
                if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
                {
                    var phoneValidator = new InternationalPhoneAttribute();
                    if (!phoneValidator.IsValid(request.PhoneNumber))
                    {
                        validationResults.Add(new ValidationResult(
                            phoneValidator.FormatErrorMessage("Phone Number"),
                            new[] { nameof(request.PhoneNumber) }));
                        isValid = false;
                    }
                }

                if (!isValid)
                {
                    _logger.Warning("Validation failed for /signup request: {ValidationResults}", validationResults);
                    return Result<SignUpResponseDto>.Failure("failed", validationResults);
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
                    await _roleManager.CreateAsync(new IdentityRole<Guid>(request.Role));
                }

                var locationInfoResponse = await _utilityService.GetGeoInfoByClientIp();
                if (!locationInfoResponse.Succeeded || !locationInfoResponse.Data.Success) return Result<SignUpResponseDto>.Failure(locationInfoResponse.Message);

                // Normalize phone number with country code from location
                var normalizedPhoneNumber = PhoneHelper.NormalizePhoneNumber(request.PhoneNumber, locationInfoResponse.Data.Country_code);

                // Check if phone number already exists 
                var existingPhoneUser = await _userManager.Users.FirstOrDefaultAsync(u => u.PhoneNumber == normalizedPhoneNumber);
                if (existingPhoneUser != null)
                    return Result<SignUpResponseDto>.Failure("User with this phone number already exists");


                var user = new Domain.Entities.User
                {
                    FullName = request.FullName,
                    UserName = request.Email,
                    Email = request.Email,
                    City = locationInfoResponse.Data.City,
                    Country = locationInfoResponse.Data.Country,
                    CurrencySymbol = locationInfoResponse.Data.Currency_symbol,
                    CountryCode = locationInfoResponse.Data.Country_code,
                    CountryFlag = locationInfoResponse.Data.Country_flag,
                    CurrencyCode = locationInfoResponse.Data.Currency_Code,
                    PhoneNumber = normalizedPhoneNumber
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