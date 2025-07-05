using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Yiodara.Application.Common;
using Yiodara.Application.DTOs;
using Yiodara.Application.Features.Country.Query;

namespace Yiodara.Api.Controllers
{
    public class CountryController : BaseApiController
    {
        private readonly IMediator _mediator;
        public CountryController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [AllowAnonymous]
        [HttpGet("get-countries")]
        [ProducesResponseType(typeof(Result<List<CountryDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result<List<CountryDto>>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(Result<List<CountryDto>>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCountries()
        {
            var query = new GetCountriesQuery();
            var result = await _mediator.Send(query);
            return result.Succeeded
                    ? Ok(result)
                    : BadRequest(result);
        }
    }
}