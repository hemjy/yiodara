using MediatR;
using Microsoft.AspNetCore.Identity;
using Serilog;
using System.ComponentModel.DataAnnotations;
using Yiodara.Application.Common;
using Yiodara.Application.DTOs;
using Yiodara.Application.Interfaces.Email;

namespace Yiodara.Application.Features.Auth.Commands
{
    public class RequestOtpForPasswordResetCommand : IRequest<Result<GetOtpForPasswordResetResponseDto>>
    {
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string? Email { get; set; }
    }

    public class GetOtpForPasswordResetResponseDto
    {
        public string Email { get; set; }
        public string Message { get; set; }
    }

    public class RequestPasswordResetCommandHandler : IRequestHandler<RequestOtpForPasswordResetCommand, Result<GetOtpForPasswordResetResponseDto>>
    {
        private readonly UserManager<Domain.Entities.User> _userManager;
        private readonly ILogger _logger;
        private readonly IEmailService _emailService;

        public RequestPasswordResetCommandHandler(
            UserManager<Domain.Entities.User> userManager,
            ILogger logger,
            IEmailService emailService)
        {
            _userManager = userManager;
            _logger = logger;
            _emailService = emailService;
        }

        public async Task<Result<GetOtpForPasswordResetResponseDto>> Handle(RequestOtpForPasswordResetCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling password reset request for email: {Email}", request.Email);

                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);

                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);

                if (!isValid)
                {
                    _logger.Warning("Validation failed for /request-password-reset request: {ValidationResults}", validationResults);
                    return Result<GetOtpForPasswordResetResponseDto>.Failure("Validation failed", validationResults);
                }

                var user = await _userManager.FindByEmailAsync(request.Email);

                if (user == null)
                {
                    _logger.Warning("Password reset requested for non-existent user: {Email}", request.Email);
                    return Result<GetOtpForPasswordResetResponseDto>.Success(
                        new GetOtpForPasswordResetResponseDto
                        {
                            Email = request.Email,
                            Message = "If your email is registered with us, you will receive a password reset OTP shortly."
                        },
                        "Password reset OTP sent"
                    );
                }

                // Generate OTP (6-digit number)
                Random random = new Random();
                string otp = random.Next(100000, 999999).ToString();

                // Store OTP in user claims with expiration time (10 minutes from now)
                var otpClaim = await _userManager.GetClaimsAsync(user);
                var existingOtpClaim = otpClaim.FirstOrDefault(c => c.Type == "PasswordResetOTP");
                if (existingOtpClaim != null)
                {
                    await _userManager.RemoveClaimAsync(user, existingOtpClaim);
                }

                var expirationTime = DateTime.UtcNow.AddMinutes(10);
                await _userManager.AddClaimAsync(user, new System.Security.Claims.Claim("PasswordResetOTP", otp));
                await _userManager.AddClaimAsync(user, new System.Security.Claims.Claim("PasswordResetOTPExpiry", expirationTime.ToString("o")));

                // Send email with OTP
                var emailBody = $@"
                    <h2>Password Reset Request</h2>
                    <p>Your OTP for password reset is: <strong>{otp}</strong></p>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p>If you did not request a password reset, please ignore this email.</p>";

                var recieverDetails = new MailReceiverDto()
                {
                    Email = "ibrahimjunior67@yahoo.com", // user.Email,
                    Name = user.FullName
                };

                var mailRequest = new MailRequests()
                {
                    Body = "Hello There",
                    HtmlContent = emailBody,
                    Subject = "Password Reset OTP",
                    Title = "Password Reset OTP",
                    ToEmail = user.Email
                };


                await _emailService.SendEmailAsync(recieverDetails, mailRequest);

                return Result<GetOtpForPasswordResetResponseDto>.Success(
                    new GetOtpForPasswordResetResponseDto
                    {
                        Email = request.Email,
                        Message = "Password reset OTP has been sent to your email."
                    },
                    "Password reset OTP sent"
                );
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during password reset request");
                return Result<GetOtpForPasswordResetResponseDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }

}
