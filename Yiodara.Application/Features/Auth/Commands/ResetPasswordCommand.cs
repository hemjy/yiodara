using MediatR;
using Microsoft.AspNetCore.Identity;
using Serilog;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.Common;

namespace Yiodara.Application.Features.Auth.Commands
{
    public class ResetPasswordCommand : IRequest<Result<ResetPasswordResponseDto>>
    {
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string? Email { get; set; }

        [Required(ErrorMessage = "OTP is required.")]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "OTP must be 6 digits.")]
        public string? OTP { get; set; }

        [Required(ErrorMessage = "New password is required.")]
        public string? NewPassword { get; set; }

        [Required(ErrorMessage = "Confirm password is required.")]
        [Compare("NewPassword", ErrorMessage = "Passwords do not match.")]
        public string? ConfirmPassword { get; set; }
    }

    public class ResetPasswordResponseDto
    {
        public string Email { get; set; }
        public string Message { get; set; }
    }

    public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result<ResetPasswordResponseDto>>
    {
        private readonly UserManager<Domain.Entities.User> _userManager;
        private readonly ILogger _logger;

        public ResetPasswordCommandHandler(
            UserManager<Domain.Entities.User> userManager,
            ILogger logger)
        {
            _userManager = userManager;
            _logger = logger;
        }

        public async Task<Result<ResetPasswordResponseDto>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling password reset verification for email: {Email}", request.Email);

                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);

                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);

                if (!isValid)
                {
                    _logger.Warning("Validation failed for /reset-password request: {ValidationResults}", validationResults);
                    return Result<ResetPasswordResponseDto>.Failure("Validation failed", validationResults);
                }

                // Validate password complexity
                var user = await _userManager.FindByEmailAsync(request.Email);
                if (user == null)
                {
                    return Result<ResetPasswordResponseDto>.Failure("Invalid email or OTP");
                }

                // Verify OTP
                var claims = await _userManager.GetClaimsAsync(user);
                var otpClaim = claims.FirstOrDefault(c => c.Type == "PasswordResetOTP");
                var otpExpiryClaim = claims.FirstOrDefault(c => c.Type == "PasswordResetOTPExpiry");

                if (otpClaim == null || otpExpiryClaim == null)
                {
                    return Result<ResetPasswordResponseDto>.Failure("No active password reset request found");
                }

                // Check if OTP is expired
                if (!DateTime.TryParse(otpExpiryClaim.Value, out DateTime expiryTime) || DateTime.UtcNow > expiryTime)
                {
                    // Remove expired OTP claims
                    await _userManager.RemoveClaimAsync(user, otpClaim);
                    await _userManager.RemoveClaimAsync(user, otpExpiryClaim);

                    return Result<ResetPasswordResponseDto>.Failure("OTP has expired. Please request a new one");
                }

                // Verify OTP value
                if (otpClaim.Value != request.OTP)
                {
                    return Result<ResetPasswordResponseDto>.Failure("Invalid OTP");
                }

                // Validate password complexity
                var passwordValidator = new PasswordValidator<Domain.Entities.User>();
                var passwordValidationResult = await passwordValidator.ValidateAsync(_userManager, null, request.NewPassword);
                if (!passwordValidationResult.Succeeded)
                {
                    var errors = passwordValidationResult.Errors
                        .Select(e => e.Description)
                        .ToList();
                    return Result<ResetPasswordResponseDto>.Failure("Password validation failed", errors);
                }

                // Reset password
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var resetResult = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);

                if (!resetResult.Succeeded)
                {
                    var errors = resetResult.Errors
                        .Select(e => e.Description)
                        .ToList();
                    return Result<ResetPasswordResponseDto>.Failure("Password reset failed", errors);
                }

                // Remove OTP claims after successful reset
                await _userManager.RemoveClaimAsync(user, otpClaim);
                await _userManager.RemoveClaimAsync(user, otpExpiryClaim);

                return Result<ResetPasswordResponseDto>.Success(
                    new ResetPasswordResponseDto
                    {
                        Email = request.Email,
                        Message = "Password has been reset successfully"
                    },
                    "Password reset successful"
                );
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during password reset");
                return Result<ResetPasswordResponseDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}
