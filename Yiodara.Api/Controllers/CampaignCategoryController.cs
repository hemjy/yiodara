using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Yiodara.Application.Common;
using Yiodara.Application.DTOs;
using Yiodara.Application.Features.Auth.Commands;
using Yiodara.Application.Features.CampaignCategory.Command;
using Yiodara.Application.Features.CampaignCategory.Query;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
using ILogger = Serilog.ILogger;

namespace Yiodara.Api.Controllers
{
    public class CampaignCategoryController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly ILogger _logger;

        public CampaignCategoryController(IMediator mediator, ILogger logger)
        {
            _mediator = mediator;
            _logger = logger;
        }


        [Authorize(Policy = "AdminOnly")]
        [ProducesResponseType(typeof(Result<Guid>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<Guid>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<Guid>), StatusCodes.Status500InternalServerError)]
        [HttpPost("create-campaign-category")]
        public async Task<IActionResult> CreateCampaign([FromBody] CreateCampaignCatergoryCommand command)
        {
            try
            {
                if (command == null)
                {
                    _logger.Warning("Null create campaign command received");
                    return BadRequest(Result<Guid>.Failure("Invalid campaign request"));
                }

                var result = await _mediator.Send(command);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error while creating campaign category");
                return StatusCode(500, Result<Guid>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        [Authorize(Policy = "AdminOnly")]
        [HttpGet("get-campaign-category/{id}")]
        [ProducesResponseType(typeof(Result<GetCampaignCategoryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<GetCampaignCategoryDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<GetCampaignCategoryDto>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCampaign([FromRoute] Guid id)
        {
            try
            {
                var command = new GetCampaignCategoryQuery { Id = id };

                if (command == null)
                {
                    _logger.Warning("Null get campaign query received");
                    return BadRequest(Result<GetCampaignCategoryDto>.Failure("Invalid get campaign request"));
                }

                var result = await _mediator.Send(command);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error while getting campaign category");
                return StatusCode(500, Result<GetCampaignCategoryDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        [Authorize(Policy = "AdminOnly")]
        [HttpGet("get-all")]
        [ProducesResponseType(typeof(Result<GetCampaignCategoryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<GetCampaignCategoryDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<GetCampaignCategoryDto>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllByFilter([FromQuery] GetCampaignCategoriesQuery model, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(model, cancellationToken);
           
            try
            {
                if (model == null)
                {
                    _logger.Warning("Null get campaign category query received");
                    return BadRequest(Result<UpdateCampaignCategoryDto>.Failure("Invalid get campaign category request"));
                }

                var result = await _mediator.Send(model);
                return response.Succeeded
                    ? Ok(response)
                    : BadRequest(response);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error while getting campaign category");
                return StatusCode(500, Result<GetCampaignCategoryDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        [Authorize(Policy = "AdminOnly")]
        [HttpPut("update-campaign-category")]
        [ProducesResponseType(typeof(Result<UpdateCampaignCategoryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<UpdateCampaignCategoryDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<UpdateCampaignCategoryDto>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateCampaign([FromBody] UpdateCampaignCategoryCommand command)
        {
            try
            {
                if (command == null)
                {
                    _logger.Warning("Null update campaign query received");
                    return BadRequest(Result<UpdateCampaignCategoryDto>.Failure("Invalid update campaign request"));
                }

                var result = await _mediator.Send(command);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error while updating campaign category");
                return StatusCode(500, Result<UpdateCampaignCategoryDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        [Authorize(Policy = "AdminOnly")]
        [HttpDelete("delete-campaign-category")]
        [ProducesResponseType(typeof(Result<string>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<string>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<string>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteCampaign([FromBody] DeleteCampaignCategoryCommand command)
        {
            try
            {
                if (command == null)
                {
                    _logger.Warning("Null delete campaign query received");
                    return BadRequest(Result<string>.Failure("Invalid delete campaign request"));
                }

                var result = await _mediator.Send(command);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error while getting campaign category");
                return StatusCode(500, Result<string>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }
    }
}
