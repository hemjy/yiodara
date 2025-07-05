using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Yiodara.Application.Common;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;

namespace Yiodara.Application.Features.Admin.Query
{
    public class GetFundraisingStatisticsQuery : IRequest<Result<FundraisingStatisticsDto>>
    {
    }

    public class FundraisingStatisticsDto
    {
        public string TotalFundsRaised { get; set; }
        public int MonthlyDonors { get; set; }
        public int SuccessfulCampaigns { get; set; }
        public int PeopleBenefited { get; set; }
    }

    public class GetFundraisingStatisticsQueryHandler : IRequestHandler<GetFundraisingStatisticsQuery, Result<FundraisingStatisticsDto>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<PaymentTransaction> _paymentTransaction;

        // Static number as requested
        private const int PEOPLE_BENEFITED = 10000;

        public GetFundraisingStatisticsQueryHandler(
            ILogger logger,
            IGenericRepositoryAsync<PaymentTransaction> paymentTransaction)
        {
            _logger = logger;
            _paymentTransaction = paymentTransaction;
        }

        public async Task<Result<FundraisingStatisticsDto>> Handle(GetFundraisingStatisticsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Getting fundraising statistics");

                // Get all paid transactions
                var query = _paymentTransaction.GetAllQuery();
                var paidTransactions = await query
                    .Where(x => !x.IsDeleted && x.Status.ToLower() == "paid")
                    .ToListAsync(cancellationToken);

                // Calculate total funds raised (in USD)
                decimal totalFundsRaised = paidTransactions.Sum(x => x.DollarValue);

                // Get monthly donors (total count of transactions in the last month)
                var oneMonthAgo = DateTime.UtcNow.AddMonths(-1);
                var monthlyDonors = paidTransactions
                    .Count(x => x.Date >= oneMonthAgo);

                // Get successful campaigns (campaigns with at least one paid transaction)
                var successfulCampaigns = paidTransactions
                    .Select(x => x.CampaignId)
                    .Distinct()
                    .Count();

                var result = new FundraisingStatisticsDto
                {
                    TotalFundsRaised = totalFundsRaised.ToString("N0"),
                    MonthlyDonors = monthlyDonors,
                    SuccessfulCampaigns = successfulCampaigns,
                    PeopleBenefited = PEOPLE_BENEFITED
                };

                return Result<FundraisingStatisticsDto>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error while getting fundraising statistics");
                return Result<FundraisingStatisticsDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}