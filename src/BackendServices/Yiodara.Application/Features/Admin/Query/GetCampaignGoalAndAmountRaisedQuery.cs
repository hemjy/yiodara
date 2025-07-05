using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.Features.Campaign.Query;
using Yiodara.Application.Interfaces.Repositories;

namespace Yiodara.Application.Features.Admin.Query
{
    public class GetCampaignGoalAndAmountRaisedQuery : IRequest<Result<GoalAndAmountRaisedDto>>
    {
        [Required]
        public Guid Id { get; set; }
    }

    public class GoalAndAmountRaisedDto
    {
        public string Goal { get; set; }
        public string AmountRaised { get; set; }
        public string Currency { get; set; }
    }

    public class GetCampaignGoalAndAmountRaisedQueryHandler : IRequestHandler<GetCampaignGoalAndAmountRaisedQuery, Result<GoalAndAmountRaisedDto>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.PaymentTransaction> _paymentTransaction;

        public GetCampaignGoalAndAmountRaisedQueryHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.PaymentTransaction> paymentTransaction)
        {
            _logger = logger;
            _paymentTransaction = paymentTransaction;
        }

        public async Task<Result<GoalAndAmountRaisedDto>> Handle(GetCampaignGoalAndAmountRaisedQuery request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("getting campaign and amount raised");
                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);
                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);
                if (!isValid)
                {
                    _logger.Warning("Validation failed for getting campaign and amount raised: {ValidationResults}", validationResults);
                    return Result<GoalAndAmountRaisedDto>.Failure("failed", validationResults);
                }

                // Get campaign information
                var campaign = await _paymentTransaction.GetByAsync(x => x.CampaignId == request.Id && !x.IsDeleted, x => x.Campaign);

                if (campaign == null)
                {
                    _logger.Warning("Campaign not found with ID: {CampaignId}", request.Id);
                    return Result<GoalAndAmountRaisedDto>.Failure("Campaign not found");
                }

                // Query to get the sum of paid payment transactions
                var query = _paymentTransaction.GetAllQuery();
                var paidTransactions = await query
                    .Where(x => x.CampaignId == request.Id && !x.IsDeleted && x.Status.ToLower() == "paid")
                    .ToListAsync(cancellationToken);

                decimal totalAmountRaised = paidTransactions.Sum(x => x.DollarValue);

                var result = new GoalAndAmountRaisedDto
                {
                    Goal = campaign.Campaign.Amount.ToString("N2"),
                    AmountRaised = totalAmountRaised.ToString("N2"), 
                    Currency = campaign.Campaign.Currency ?? "USD"
                };

                return Result<GoalAndAmountRaisedDto>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error while getting goal and campaign info using campign id: {CampaignId}", request.Id);
                return Result<GoalAndAmountRaisedDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}