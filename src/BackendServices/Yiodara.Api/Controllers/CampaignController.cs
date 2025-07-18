﻿using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Yiodara.Application.Common;
using Yiodara.Application.Features.Campaign.Command;
using Yiodara.Application.Features.Campaign.Query;
using Yiodara.Application.Features.CampaignCategory.Command;
using Yiodara.Application.Features.CampaignCategory.Query;
using ILogger = Serilog.ILogger;


namespace Yiodara.Api.Controllers
{
    public class CampaignController :  BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly ILogger _logger;

        public CampaignController(IMediator mediator, ILogger logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        //[Authorize(Policy = "AdminOnly")]
        [AllowAnonymous]
        [HttpPost("create-campaign")]
        [ProducesResponseType(typeof(Result<Guid>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<Guid>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<Guid>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateCampaign([FromBody] CreateCampaignCommand command)
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
                _logger.Error(ex, "Unexpected error while creating campaign");
                return StatusCode(500, Result<Guid>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        [AllowAnonymous]
        [HttpGet("get-all")]
        [ProducesResponseType(typeof(Result<GetCampaignsDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<GetCampaignsDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<GetCampaignsDto>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllByFilter([FromQuery] GetCampaignsQuery model, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(model, cancellationToken);
            return response.Succeeded
                    ? Ok(response)
                    : BadRequest(response);
        }

        [AllowAnonymous]
        [HttpGet("get-all-draft-campaigns")]
        [ProducesResponseType(typeof(Result<GetCampaignsDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<GetCampaignsDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<GetCampaignsDto>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllDraftCampaigns([FromQuery] GetDraftCampaignsQuery model, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(model, cancellationToken);
            return response.Succeeded
                    ? Ok(response)
                    : BadRequest(response);
        }

        [AllowAnonymous]
        [HttpGet("get-campaign/{id}")]
        [ProducesResponseType(typeof(Result<GetCampaignByIdDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<GetCampaignByIdDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<GetCampaignByIdDto>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCampaign([FromRoute] Guid id)
        {
            try
            {
                var command = new GetCampaignByIdQuery { Id = id };

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
                _logger.Error(ex, "Unexpected error while getting campaign");
                return StatusCode(500, Result<GetCampaignCategoryDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }


        //[Authorize(Policy = "AdminOnly")]
        [AllowAnonymous]
        [HttpPut("update-campaign")]
        [ProducesResponseType(typeof(Result<UpdateCampaignDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<UpdateCampaignDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<UpdateCampaignDto>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateCampaign([FromBody] UpdateCampaignCommand command)
        {
            try
            {
                if (command == null)
                {
                    _logger.Warning("Null update campaign query received");
                    return BadRequest(Result<UpdateCampaignDto>.Failure("Invalid update campaign request"));
                }

                var result = await _mediator.Send(command);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error while updating campaign");
                return StatusCode(500, Result<UpdateCampaignDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        [Authorize(Policy = "AdminOnly")]
        [HttpDelete("delete-campaign")]
        [ProducesResponseType(typeof(Result<string>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<string>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<string>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteCampaign([FromBody] DeleteCampaignCommand command)
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
                _logger.Error(ex, "Unexpected error while deleting campaign");
                return StatusCode(500, Result<string>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }


        [Authorize(Policy = "AdminOnly")]
        [HttpDelete("delete-campaign-image")]
        [ProducesResponseType(typeof(Result<string>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<string>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<string>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteCampaignImage([FromBody] DeleteCampaignImageCommand command)
        {
            try
            {
                if (command == null)
                {
                    _logger.Warning("Null delete campaign image query received");
                    return BadRequest(Result<string>.Failure("Invalid delete campaign request"));
                }

                var result = await _mediator.Send(command);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error while deleting campaign image");
                return StatusCode(500, Result<string>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }
    }
}
