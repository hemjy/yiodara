using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Serilog;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Yiodara.Application.Common;

namespace Yiodara.Application.Features.Auth.Commands
{
    public class ChangePasswordCommand : IRequest<Result<ChangePasswordResponseDto>>
    {
        [Required(ErrorMessage = "Current password is required.")]
        public string? CurrentPassword { get; set; }

        [Required(ErrorMessage = "New password is required.")]
        public string? NewPassword { get; set; }

        [Required(ErrorMessage = "Confirm password is required.")]
        [Compare("NewPassword", ErrorMessage = "Passwords do not match.")]
        public string? ConfirmPassword { get; set; }
    }

    public class ChangePasswordResponseDto
    {
        public string Message { get; set; }
    }

    public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Result<ChangePasswordResponseDto>>
    {
        private readonly UserManager<Domain.Entities.User> _userManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;

        public ChangePasswordCommandHandler(
            UserManager<Domain.Entities.User> userManager,
            IHttpContextAccessor httpContextAccessor,
            ILogger logger)
        {
            _userManager = userManager;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task<Result<ChangePasswordResponseDto>> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling password change for authenticated user");

                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);

                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);

                if (!isValid)
                {
                    _logger.Warning("Validation failed for /change-password request: {ValidationResults}", validationResults);
                    return Result<ChangePasswordResponseDto>.Failure("Validation failed", validationResults);
                }

                // Get email from JWT token claims
                var userEmail = _httpContextAccessor?.HttpContext?.User.FindFirst(ClaimTypes.Email)?.Value
                             ?? _httpContextAccessor?.HttpContext?.User.FindFirst("email")?.Value;

                if (string.IsNullOrEmpty(userEmail))
                {
                    return Result<ChangePasswordResponseDto>.Failure("User email not found in token");
                }

                var user = await _userManager.FindByEmailAsync(userEmail);
                if (user == null)
                {
                    return Result<ChangePasswordResponseDto>.Failure("User not found");
                }

                // Verify current password
                var isCurrentPasswordValid = await _userManager.CheckPasswordAsync(user, request.CurrentPassword);
                if (!isCurrentPasswordValid)
                {
                    return Result<ChangePasswordResponseDto>.Failure("Current password is incorrect");
                }

                // Validate new password complexity
                var passwordValidator = new PasswordValidator<Domain.Entities.User>();
                var passwordValidationResult = await passwordValidator.ValidateAsync(_userManager, user, request.NewPassword);
                if (!passwordValidationResult.Succeeded)
                {
                    var errors = passwordValidationResult.Errors
                        .Select(e => e.Description)
                        .ToList();
                    return Result<ChangePasswordResponseDto>.Failure("Password validation failed", errors);
                }

                // Change password
                var changeResult = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);

                if (!changeResult.Succeeded)
                {
                    var errors = changeResult.Errors
                        .Select(e => e.Description)
                        .ToList();
                    return Result<ChangePasswordResponseDto>.Failure("Password change failed", errors);
                }

                return Result<ChangePasswordResponseDto>.Success(
                    new ChangePasswordResponseDto
                    {
                        Message = "Password has been changed successfully"
                    },
                    "Password change successful"
                );
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during password change");
                return Result<ChangePasswordResponseDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}