using MediatR;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using Yiodara.Application.Common;
using Yiodara.Application.DTOs;
using Yiodara.Application.Features.Auth.Commands;
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

        [HttpPost("signup")]
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

        [HttpPost("login")]
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

        [HttpPost("refreshToken")]
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


    }
}
