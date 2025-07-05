using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Yiodara.Application.Common;
using Yiodara.Application.Interfaces;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;

namespace Yiodara.Application.Features.Admin.Query
{
    public class GetDonorCountriesPercentageQuery : IRequest<Result<List<DonorCountryPercentageDto>>>
    {
        public Guid? CampaignId { get; set; }
    }

    public class DonorCountryPercentageDto
    {
        public string Country { get; set; }
        public string CurrencyCode { get; set; }
        public int DonorCount { get; set; }
        public decimal Percentage { get; set; }
    }

    public class GetDonorCountriesPercentageQueryHandler : IRequestHandler<GetDonorCountriesPercentageQuery, Result<List<DonorCountryPercentageDto>>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<PaymentTransaction> _paymentRepository;
        private readonly ICurrencyCountryMappingService _currencyCountryMappingService;

        public GetDonorCountriesPercentageQueryHandler(
            ILogger logger,
            IGenericRepositoryAsync<PaymentTransaction> paymentRepository,
            ICurrencyCountryMappingService currencyCountryMappingService)
        {
            _logger = logger;
            _paymentRepository = paymentRepository;
            _currencyCountryMappingService = currencyCountryMappingService;
        }

        public async Task<Result<List<DonorCountryPercentageDto>>> Handle(GetDonorCountriesPercentageQuery request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Getting donor countries percentage distribution");

                // Get all successful payment transactions
                var paymentsQuery = _paymentRepository.GetAllQuery()
                    .Where(p => p.Status.ToLower() == "paid");

                // Filter by campaign if specified
                if (request.CampaignId.HasValue)
                {
                    paymentsQuery = paymentsQuery.Where(p => p.CampaignId == request.CampaignId.Value);
                }

                // Group by currency and count
                var currencyGroups = await paymentsQuery
                    .GroupBy(p => p.Currency)
                    .Select(g => new
                    {
                        CurrencyCode = g.Key,
                        Count = g.Count()
                    })
                    .ToListAsync(cancellationToken);

                // Calculate total donations
                int totalDonations = currencyGroups.Sum(g => g.Count);

                if (totalDonations == 0)
                {
                    return Result<List<DonorCountryPercentageDto>>.Failure("No donations found");
                }

                // Map currencies to countries and calculate percentages
                var result = currencyGroups.Select(g =>
                {
                    string country = _currencyCountryMappingService.GetCountryFromCurrency(g.CurrencyCode);
                    decimal percentage = (decimal)g.Count / totalDonations * 100;

                    return new DonorCountryPercentageDto
                    {
                        Country = country,
                        CurrencyCode = g.CurrencyCode,
                        DonorCount = g.Count,
                        Percentage = Math.Round(percentage, 2)
                    };
                })
                .OrderByDescending(d => d.Percentage)
                .ToList();

                return Result<List<DonorCountryPercentageDto>>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error while retrieving donor countries percentage distribution");
                return Result<List<DonorCountryPercentageDto>>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }

    }
}