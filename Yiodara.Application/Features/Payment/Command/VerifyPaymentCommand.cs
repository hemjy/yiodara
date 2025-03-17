using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Stripe.Checkout;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;

namespace Yiodara.Application.Features.Payment.Command
{
    public class VerifyPaymentCommand : IRequest<Result<VerifyPaymentResponse>>
    {
        [Required(ErrorMessage = "Session ID is required.")]
        public string SessionId { get; set; }
    }

    public class VerifyPaymentResponse
    {
        public bool IsSuccessful { get; set; }
        public string Status { get; set; }
        public string ReferenceNo { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string CustomerEmail { get; set; }
    }

    public class VerifyPaymentCommandHandler : IRequestHandler<VerifyPaymentCommand, Result<VerifyPaymentResponse>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<PaymentTransaction> _paymentRepository;

        public VerifyPaymentCommandHandler(
            ILogger logger,
            IGenericRepositoryAsync<PaymentTransaction> paymentRepository)
        {
            _logger = logger;
            _paymentRepository = paymentRepository;
        }

        public async Task<Result<VerifyPaymentResponse>> Handle(VerifyPaymentCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling payment verification for session {SessionId}", request.SessionId);

                // Retrieve the session from Stripe
                var sessionService = new SessionService();
                var session = await sessionService.GetAsync(request.SessionId, cancellationToken: cancellationToken);

                // Check if session exists
                if (session == null)
                {
                    _logger.Warning("Session {SessionId} not found", request.SessionId);
                    return Result<VerifyPaymentResponse>.Failure("Payment session not found");
                }

                // Find the existing transaction in our database
                var transaction = await _paymentRepository.GetAllQuery()
                                        .FirstOrDefaultAsync(t => t.ReferenceNo == request.SessionId);

                if (transaction == null)
                {
                    _logger.Warning("Transaction for session {SessionId} not found in database", request.SessionId);
                    return Result<VerifyPaymentResponse>.Failure("Transaction record not found");
                }

                // Update the transaction status
                transaction.Status = session.PaymentStatus;
                transaction.ProviderResponse = JsonSerializer.Serialize(session);

                await _paymentRepository.UpdateAsync(transaction);

                var response = new VerifyPaymentResponse
                {
                    IsSuccessful = session.PaymentStatus == "paid",
                    Status = session.PaymentStatus,
                    ReferenceNo = session.Id,
                    Amount = (decimal)(session.AmountTotal / 100.0),
                    Currency = session.Currency,
                    CustomerEmail = session.CustomerEmail
                };

                return Result<VerifyPaymentResponse>.Success(response, "Payment verification completed");
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error verifying payment for session {SessionId}", request.SessionId);
                return Result<VerifyPaymentResponse>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}