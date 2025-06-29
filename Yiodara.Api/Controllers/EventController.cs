using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Yiodara.Application.Common;
using Yiodara.Application.Features.Campaign.Command;
using Yiodara.Application.Features.Event.Command;
using Yiodara.Application.Helpers;
using ILogger = Serilog.ILogger;

namespace Yiodara.Api.Controllers
{
    public class EventController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly ILogger _logger;

        public EventController(IMediator mediator, ILogger logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpPost("create-event")]
        [ProducesResponseType(typeof(Result<Guid>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<Guid>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<Guid>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateEvent([FromBody] CreateEventCommand command)
        {
            try
            {
                if (command == null)
                {
                    _logger.Warning("Null create event command received");
                    return BadRequest(Result<Guid>.Failure("Invalid event request"));
                }

                var result = await _mediator.Send(command);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error while creating event");
                return StatusCode(500, Result<Guid>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        [HttpGet("time-options")]
        public ActionResult<List<string>> GetTimeOptions()
        {
            var timeOptions = TimeHelper.GetTimeOptions();
            return Ok(timeOptions);
        }

        [AllowAnonymous]
        [HttpGet]
        [ProducesResponseType(typeof(Result<List<Yiodara.Application.Features.Event.Query.GetEventsDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetEvents([FromQuery] Yiodara.Application.Features.Event.Query.GetEventsQuery query)
        {
            var result = await _mediator.Send(query);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Result<Yiodara.Application.Features.Event.Query.GetEventByIdDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetEventById(Guid id)
        {
            var query = new Yiodara.Application.Features.Event.Query.GetEventByIdQuery { Id = id };
            var result = await _mediator.Send(query);
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [Authorize]
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(Result<Yiodara.Application.Features.Event.Command.UpdateEventDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateEvent(Guid id, [FromBody] Yiodara.Application.Features.Event.Command.UpdateEventCommand command)
        {
            if (command == null || id != command.Id)
                return BadRequest(Result<string>.Failure("Invalid event update request"));
            var result = await _mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [Authorize]
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(Result<string>), StatusCodes.Status200OK)]
        public async Task<IActionResult> DeleteEvent(Guid id)
        {
            var command = new Yiodara.Application.Features.Event.Command.DeleteEventCommand { Id = id };
            var result = await _mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}