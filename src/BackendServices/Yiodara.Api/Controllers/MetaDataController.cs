using Microsoft.AspNetCore.Mvc;
using Yiodara.Domain.Enums;

namespace Yiodara.Api.Controllers
{
    public class MetaDataController : BaseApiController
    {
        [HttpGet("metadata")]
        public IActionResult GetApiMetadata()
        {
            return Ok(new
            {
                Endpoints = new[]
                {
                    new {
                            Path = "/api/Admin/get-user-donation-history?UserId",
                            SortOptions = new[]
                            {
                                new { Value = (int)ListOrder.DonationDate, DisplayName = "Donation Date" }
                            }
                        }
                }
            });
        }
    }
}
