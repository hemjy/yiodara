using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using Yiodara.Application.Common;
using Yiodara.Application.DTOs;
using Yiodara.Application.Features.Auth.Commands;
using Yiodara.Application.Features.Payment.Command;
using ILogger = Serilog.ILogger;

namespace Yiodara.Api.Controllers
{

    public class AuthController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly ILogger _logger;

        public AuthController(IMediator mediator, ILogger logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpPost("signup")]
        [ProducesResponseType(typeof(Result<SignUpResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<SignUpResponseDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<SignUpResponseDto>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SignUp([FromBody] SignUpUserCommand command)
        {
            try
            {
                if (command == null)
                {
                    _logger.Warning("Null signup command received");
                    return BadRequest(Result<SignUpResponseDto>.Failure("Invalid signup request"));
                }

                var result = await _mediator.Send(command);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }
          
            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error during signup");
                return StatusCode(500, Result<SignUpResponseDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        [AllowAnonymous]
        [HttpPost("signup-volunteer")]
        [ProducesResponseType(typeof(Result<SignUpResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<SignUpResponseDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<SignUpResponseDto>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SignUpVolunteer([FromBody] SignUpVolunteerCommand command)
        {
            try
            {
                if (command == null)
                {
                    _logger.Warning("Null signup command received");
                    return BadRequest(Result<SignUpResponseDto>.Failure("Invalid signup request"));
                }

                var result = await _mediator.Send(command);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error during signup");
                return StatusCode(500, Result<SignUpResponseDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        [AllowAnonymous]
        [HttpPost("login")]
        [ProducesResponseType(typeof(Result<LoginResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<LoginResponseDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<LoginResponseDto>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Login([FromBody] LoginUserCommand command)
        {
            try
            {
                if (command == null)
                {
                    _logger.Warning("Null login command received");
                    return BadRequest(Result<LoginResponseDto>.Failure("Invalid login request"));
                }

                var result = await _mediator.Send(command);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error during login");
                return StatusCode(500, Result<LoginResponseDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        [AllowAnonymous]
        [HttpPost("refreshToken")]
        [ProducesResponseType(typeof(Result<RefreshTokenDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<RefreshTokenDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<RefreshTokenDto>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
        {
            try
            {
                if (command == null)
                {
                    _logger.Warning("Null refresh token command received");
                    return BadRequest(Result<LoginResponseDto>.Failure("Invalid token request"));
                }

                var result = await _mediator.Send(command);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error during refresh token command");
                return StatusCode(500, Result<LoginResponseDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        [AllowAnonymous]
        [HttpPost("getOtpForResetPassword")]
        [ProducesResponseType(typeof(Result<GetOtpForPasswordResetResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<GetOtpForPasswordResetResponseDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<GetOtpForPasswordResetResponseDto>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetOtpForResetPassword([FromBody] RequestOtpForPasswordResetCommand command)
        {
            try
            {
                if (command == null)
                {
                    _logger.Warning("Null generate OTP command received");
                    return BadRequest(Result<LoginResponseDto>.Failure("Invalid token request"));
                }

                var result = await _mediator.Send(command);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error during refresh token command");
                return StatusCode(500, Result<LoginResponseDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        [AllowAnonymous]
        [HttpPost("resetPassword")]
        [ProducesResponseType(typeof(Result<ResetPasswordResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<ResetPasswordResponseDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<ResetPasswordResponseDto>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ResetPasswordRequest([FromBody] ResetPasswordCommand command)
        {
            try
            {
                if (command == null)
                {
                    _logger.Warning("Null reset password command received");
                    return BadRequest(Result<LoginResponseDto>.Failure("Invalid token request"));
                }

                var result = await _mediator.Send(command);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error during refresh token command");
                return StatusCode(500, Result<LoginResponseDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

    }
}
