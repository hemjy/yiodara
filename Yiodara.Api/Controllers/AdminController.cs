using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Yiodara.Application.Common;
using Yiodara.Application.Features.Admin.Query;
using Yiodara.Application.Features.Auth.Commands;
using Yiodara.Application.Interfaces.Email;
using ILogger = Serilog.ILogger;


namespace Yiodara.Api.Controllers
{
    public class AdminController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly ILogger _logger;
        private readonly IEmailService _emailService;

        public AdminController(IMediator mediator, ILogger logger, IEmailService emailService)
        {
            _mediator = mediator;
            _logger = logger;
            _emailService = emailService;
        }

        [HttpGet("get-campaign-goal-amount-raised/{id}")]
        public async Task<IActionResult> GetCampaignGoalAndAmountRaised([FromRoute] Guid id)
        {
            try
            {
                var query = new GetCampaignGoalAndAmountRaisedQuery { Id = id };

                if (query == null)
                {
                    _logger.Warning("Null get goal query received");
                    return BadRequest(Result<GoalAndAmountRaisedDto>.Failure("Invalid signup request"));
                }

                var result = await _mediator.Send(query);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error during getting goal");
                return StatusCode(500, Result<GoalAndAmountRaisedDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        [HttpGet("get-user-donation-history")]
        public async Task<IActionResult> GetUserDonationHistory([FromQuery] GetUserDonationsHistoryQuery query)
        {
            try
            {

                if (query == null)
                {
                    _logger.Warning("Null get user donation history query received");
                    return BadRequest(Result<UserDonationsDto>.Failure("Invalid donation history request"));
                }

                var result = await _mediator.Send(query);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error during getting donation history");
                return StatusCode(500, Result<UserDonationsDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        [HttpGet("get-all-donations-by-users")]
        public async Task<IActionResult> GetAllDonations([FromQuery] GetDonorsQuery query)
        {
            try
            {
                if (query == null)
                {
                    _logger.Warning("Null get donations query received");
                    return BadRequest(Result<UserDonationsDto>.Failure("Invalid donations request"));
                }

                var result = await _mediator.Send(query);


                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error during getting donations");
                return StatusCode(500, Result<UserDonationsDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        [HttpGet("get-volunteers")]
        public async Task<IActionResult> GetAllVolunteers([FromQuery] GetVolunteersQuery query)
        {
            try
            {
                if (query == null)
                {
                    _logger.Warning("Null get volunteers query received");
                    return BadRequest(Result<VolunteerDto>.Failure("Invalid get volunteers query"));
                }

                var result = await _mediator.Send(query);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error during getting volunteers");
                return StatusCode(500, Result<VolunteerDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        [HttpGet("get-donors-by-country")]
        public async Task<IActionResult> GetDonorsByCountry([FromQuery] GetDonorCountriesPercentageQuery query)
        {
            try
            {
                if (query == null)
                {
                    _logger.Warning("Null get donors query received");
                    return BadRequest(Result<DonorCountryPercentageDto>.Failure("Invalid get donors query"));
                }

                var result = await _mediator.Send(query);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error during getting donrs");
                return StatusCode(500, Result<DonorCountryPercentageDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        [HttpGet("get-total-donors-count")]
        public async Task<IActionResult> GetTotalDonorsCount([FromQuery] GetTotalDonorsCountQuery query)
        {
            try
            {
                if (query == null)
                {
                    _logger.Warning("Null get donors count query received");
                    return BadRequest(Result<TotalDonorsCountDto>.Failure("Invalid get donors count query"));
                }

                var result = await _mediator.Send(query);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error during getting donors");
                return StatusCode(500, Result<TotalDonorsCountDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        [HttpGet("get-total-volunteer-count")]
        public async Task<IActionResult> GetTotalVolunteerCount()
        {
            try
            {
                var query = new GetTotalVolunteersCountQuery();
                if (query == null)
                {
                    _logger.Warning("Null get volunteer count query received");
                    return BadRequest(Result<TotalVolunteersCountDto>.Failure("Invalid get volunteer count query"));
                }

                var result = await _mediator.Send(query);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error during getting volunteer");
                return StatusCode(500, Result<TotalVolunteersCountDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }


        /// <summary>
        /// get fund raising statistics for homepage.
        /// </summary>
        [AllowAnonymous]
        [HttpGet("get-fund-raising-statistics")]
        [ProducesResponseType(typeof(Result<FundraisingStatisticsDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<FundraisingStatisticsDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<FundraisingStatisticsDto>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetFundraisingStatistics()
        {
            try
            {
                var query = new GetFundraisingStatisticsQuery();
                var result = await _mediator.Send(query);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error during getting statistics");
                return StatusCode(500, Result<TotalVolunteersCountDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

        //[Authorize]
        [HttpGet("get-user-details")]
        [ProducesResponseType(typeof(Result<UserDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<UserDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<UserDto>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SignUp([FromQuery] GetUserQuery request)
        {
            try
            {
                if (request == null)
                {
                    _logger.Warning("Null get user command recieved");
                    return BadRequest(Result<UserDto>.Failure("Invalid get user request"));
                }

                var result = await _mediator.Send(request);

                return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error while getting user");
                return StatusCode(500, Result<UserDto>.Failure($"An unexpected error occurred: {ex.Message}"));
            }

        }

    }
}