using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Yiodara.Application.Features.Payment.Command;

namespace Yiodara.API.Controllers
{
    [Route("api/payments")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PaymentController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Creates a payment link/checkout session that redirects to Stripe Checkout
        /// </summary>
        [HttpPost("create-payment-link")]
        public async Task<IActionResult> CreatePaymentLink([FromBody] CreatePaymentLinkCommand command)
        {
            var result = await _mediator.Send(command);

            if (result.Succeeded)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Verifies a payment session and updates the transaction status
        /// </summary>
        [HttpGet("verify-payment/{sessionId}")]
        public async Task<IActionResult> VerifyPayment(string sessionId)
        {
            var command = new VerifyPaymentCommand { SessionId = sessionId };
            var result = await _mediator.Send(command);

            if (result.Succeeded)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        /// <summary>
        /// Handles the success redirect from Stripe Checkout
        /// </summary>
        [HttpGet("payment-success")]
        public async Task<IActionResult> PaymentSuccess([FromQuery] string session_id)
        {
            var command = new VerifyPaymentCommand { SessionId = session_id };
            var result = await _mediator.Send(command);

            if (result.Succeeded && result.Data.IsSuccessful)
            {
                // You can redirect to a success page or return a view
                return Ok(new
                {
                    Message = "Payment successful",
                    ReferenceNo = result.Data.ReferenceNo,
                    Amount = result.Data.Amount,
                    Currency = result.Data.Currency
                });
            }

            // Payment was not successful
            return BadRequest(new
            {
                Message = "Payment was not successful",
                Status = result.Data?.Status ?? "Unknown"
            });
        }

        /// <summary>
        /// Handles the cancel redirect from Stripe Checkout
        /// </summary>
        [HttpGet("payment-cancel")]
        public IActionResult PaymentCancel()
        {
            // You can redirect to a cancel page or return a view
            return Ok(new { Message = "Payment was cancelled" });
        }
    }
}