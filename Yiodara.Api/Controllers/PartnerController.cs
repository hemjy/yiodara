using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Yiodara.Application.Common;
using Yiodara.Application.Features.Campaign.Query;
using Yiodara.Application.Features.CampaignCategory.Query;
using Yiodara.Application.Features.Partner.Command;
using Yiodara.Application.Features.Partner.Query;
using Yiodara.Application.Features.Payment.Command;
using Yiodara.Domain.Enums;
using ILogger = Serilog.ILogger;

namespace Yiodara.Api.Controllers
{
    [Route("api/partner")]
    [ApiController]
    public class PartnerController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger _logger;

        public PartnerController(IMediator mediator, ILogger logger)
        {
            _mediator = mediator;
            _logger = logger;
        }


        /// <summary>
        /// Creates a partner
        /// </summary>
        [AllowAnonymous]
        [HttpPost("create-partner")]
        [ProducesResponseType(typeof(Result<Guid>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<Guid>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<Guid>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreatePartner([FromBody] CreatePartnerCommand command)
        {
            try
            {
                if (command == null)
                {
                    _logger.Warning("Null create partner command received");
                    return BadRequest(Result<Guid>.Failure("Invalid campaign request"));
                }

                var result = await _mediator.Send(command);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error while creating partner");
                return StatusCode(500, Result<Guid>.Failure($"An unexpected error occurred: {ex.Message}"));
            }
        }


        [Authorize(Policy = "AdminOnly")]
        [HttpGet("get-partners")]
        [ProducesResponseType(typeof(Result<GetPartnersDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<GetPartnersDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<GetPartnersDto>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetPartners([FromQuery] GetPartnersQuery query)
        {
            try
            {
                var result = await _mediator.Send(query);
                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error while getting partners");
                return StatusCode(500, Result<Guid>.Failure($"An unexpected error occurred: {ex.Message}"));
            }
           
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpGet("get-partner/{id}")]
        [ProducesResponseType(typeof(Result<GetPartnerByIdDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<GetPartnerByIdDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<GetPartnerByIdDto>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCampaign([FromRoute] Guid id)
        {
            try
            {
                var command = new GetPartnerByIdQuery { Id = id };

                if (command == null)
                {
                    _logger.Warning("Null get campaign query received");
                    return BadRequest(Result<GetPartnerByIdDto>.Failure("Invalid get campaign request"));
                }

                var result = await _mediator.Send(command);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error while getting partner with id");
                return StatusCode(500, Result<GetCampaignCategoryDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        /// <summary>
        /// Confirms a partner by setting their status to 'Confirmed'
        /// </summary>
        /// <param name="id">The ID of the partner to confirm</param>
        /// <returns>Result with the partner ID</returns>
        [Authorize(Policy = "AdminOnly")]
        [HttpPut("{id}/confirm")]
        [ProducesResponseType(typeof(Result<Guid>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<Guid>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<Guid>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ConfirmPartner(Guid id)
        {
            try
            {
                var command = new UpdatePartnerStatusCommand(id);
                var result = await _mediator.Send(command);

                if (!result.Succeeded)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error while updating status");
                return StatusCode(500, Result<GetCampaignCategoryDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }
           
        }

    }
}
