using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Yiodara.Application.Common;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;

namespace Yiodara.Application.Features.Admin.Query
{
    public class GetTotalDonorsCountQuery : IRequest<Result<TotalDonorsCountDto>>
    {
        public Guid? CampaignId { get; set; }
    }

    public class TotalDonorsCountDto
    {
        public int TotalDonors { get; set; }
        public decimal TotalDonations { get; set; }
        public decimal DonationsToday { get; set; }
        public int TodayDonationsCount { get; set; }
        public string CampaignName { get; set; }
    }

    public class GetTotalDonorsCountQueryHandler : IRequestHandler<GetTotalDonorsCountQuery, Result<TotalDonorsCountDto>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<PaymentTransaction> _paymentRepository;
        private readonly IGenericRepositoryAsync<Domain.Entities.Campaign> _campaignRepository;

        public GetTotalDonorsCountQueryHandler(
            ILogger logger,
            IGenericRepositoryAsync<PaymentTransaction> paymentRepository,
            IGenericRepositoryAsync<Domain.Entities.Campaign> campaignRepository)
        {
            _logger = logger;
            _paymentRepository = paymentRepository;
            _campaignRepository = campaignRepository;
        }

        public async Task<Result<TotalDonorsCountDto>> Handle(GetTotalDonorsCountQuery request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Getting total donors count and today's donations");

                // Get successful payment transactions
                var paymentsQuery = _paymentRepository.GetAllQuery()
                    .Where(p => p.Status.ToLower() == "paid");

                string campaignName = "All Campaigns";

                // Filter by campaign if specified
                if (request.CampaignId.HasValue)
                {
                    paymentsQuery = paymentsQuery.Where(p => p.CampaignId == request.CampaignId.Value);

                    // Get campaign name
                    var campaign = await _campaignRepository.GetByIdAsync(request.CampaignId.Value);
                    if (campaign != null)
                    {
                        campaignName = campaign.Title;
                    }
                }

                // Count unique donors (users)
                int totalDonors = await paymentsQuery
                    .Select(p => p.UserId)
                    .Distinct()
                    .CountAsync(cancellationToken);

                // Calculate total donation amount in USD
                decimal totalAmount = await paymentsQuery
                    .SumAsync(p => p.DollarValue, cancellationToken);

                // Get today's date with time set to start of day
                DateTime today = DateTime.UtcNow;

                // Get donations made today
                var todayDonationsQuery = paymentsQuery
                    .Where(p => p.Date.Date == today);

                // Count today's donations
                int todayDonationsCount = await todayDonationsQuery
                    .CountAsync(cancellationToken);

                // Calculate today's donation amount in USD
                decimal todayDonationsAmount = await todayDonationsQuery
                    .SumAsync(p => p.DollarValue, cancellationToken);

                var result = new TotalDonorsCountDto
                {
                    TotalDonors = totalDonors,
                    TotalDonations = Math.Round(totalAmount, 2),
                    DonationsToday = Math.Round(todayDonationsAmount, 2),
                    TodayDonationsCount = todayDonationsCount,
                    CampaignName = campaignName
                };

                return Result<TotalDonorsCountDto>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error while retrieving total donors count and today's donations");
                return Result<TotalDonorsCountDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}