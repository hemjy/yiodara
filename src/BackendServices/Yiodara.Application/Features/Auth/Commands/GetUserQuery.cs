using MediatR;
using Microsoft.AspNetCore.Identity;
using Serilog;
using System.ComponentModel.DataAnnotations;
using Yiodara.Application.Common;
using Yiodara.Domain.Entities;

namespace Yiodara.Application.Features.Auth.Commands
{
    public class GetUserQuery : IRequest<Result<UserDto>>
    {
        [Required(ErrorMessage = "User ID is required.")]
        public string? UserId { get; set; }
    }

    public class UserDto
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
    }

    public class GetUserQueryHandler : IRequestHandler<GetUserQuery, Result<UserDto>>
    {
        private readonly UserManager<User> _userManager;
        private readonly ILogger _logger;

        public GetUserQueryHandler(
            UserManager<User> userManager,
            ILogger logger)
        {
            _userManager = userManager;
            _logger = logger;
        }

        public async Task<Result<UserDto>> Handle(GetUserQuery request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling get user request for ID: {UserId}", request.UserId);

                // Validate request
                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);
                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);

                if (!isValid)
                {
                    _logger.Warning("Validation failed for get user request: {ValidationResults}", validationResults);
                    return Result<UserDto>.Failure("Validation failed", validationResults);
                }

                // Find user by ID
                var user = await _userManager.FindByIdAsync(request.UserId);
                if (user == null)
                {
                    _logger.Warning("User not found with ID: {UserId}", request.UserId);
                    return Result<UserDto>.Failure("User not found");
                }

                // Map to DTO
                var userDto = new UserDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Email = user.Email,
                    FullName = user.FullName
                };

                return Result<UserDto>.Success(userDto, "User retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error retrieving user with ID: {UserId}", request.UserId);
                return Result<UserDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}