using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Yiodara.Application.Common;
using Yiodara.Application.DTOs;
using Yiodara.Application.Features.Campaign.Command;
using Yiodara.Application.Features.Notification.Command;
using Yiodara.Application.Features.Notification.Query;
using Yiodara.Application.Helpers;
using ILogger = Serilog.ILogger;

namespace Yiodara.Api.Controllers
{
    [Authorize]
    public class NotificationController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly ILogger _logger;

        public NotificationController(IMediator mediator, ILogger logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpPost("create-Notification")]
        [ProducesResponseType(typeof(Result<Guid>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<Guid>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<Guid>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationCommand command)
        {
            var result = await _mediator.Send(command);

            return result.Succeeded
                ? Ok(result)
                : BadRequest(result);

        }


       
        [HttpGet("")]
        [ProducesResponseType(typeof(Result<List<GetNotificationsDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetNotification([FromQuery]GetNotificationsQuery query)
        {
        
            var result = await _mediator.Send(query);
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

       
        [HttpPut("{id}/read")]
        [ProducesResponseType(typeof(Result<Guid>), StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateNotification([FromRoute] Guid id)
        {
            var result = await _mediator.Send(new MarkAsReadCommand(id));
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

    }
}