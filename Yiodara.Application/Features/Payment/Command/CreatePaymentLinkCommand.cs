using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
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
    public class CreatePaymentLinkCommand : IRequest<Result<CreatePaymentLinkResponse>>
    {
        [Required(ErrorMessage = "Campaign id is required.")]
        public Guid CampaignId { get; set; }

        [Required(ErrorMessage = "Amount is required.")]
        public decimal Amount { get; set; }

        public string Currency { get; set; } = "usd";

        [EmailAddress]
        public string? CustomerEmail { get; set; }

        //public string? SuccessUrl { get; set; }

        //public string? CancelUrl { get; set; }

        public string? UserId { get; set; }
    }

    public class CreatePaymentLinkResponse
    {
        public string SessionId { get; set; }
        public string PaymentUrl { get; set; }
    }

    public class CreatePaymentLinkCommandHandler : IRequestHandler<CreatePaymentLinkCommand, Result<CreatePaymentLinkResponse>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<PaymentTransaction> _paymentRepository;
        private readonly IMemoryCache _cache;
        private readonly HttpClient _httpClient;
        private const string API_BASE_URL = "https://api.exchangerate-api.com/v4/latest/";
        private const int CACHE_DURATION_HOURS = 24;
        private readonly IConfiguration _config;

        public CreatePaymentLinkCommandHandler(
            ILogger logger,
            IGenericRepositoryAsync<PaymentTransaction> paymentRepository,
            IMemoryCache cache,
            HttpClient httpClient,
            IConfiguration config)
        {
            _logger = logger;
            _paymentRepository = paymentRepository;
            _cache = cache;
            _httpClient = httpClient;
            _config = config;
        }

        public async Task<Result<CreatePaymentLinkResponse>> Handle(CreatePaymentLinkCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling create payment link request");

                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);

                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);

                if (!isValid)
                {
                    _logger.Warning("Validation failed for creating payment link request: {ValidationResults}", validationResults);
                    return Result<CreatePaymentLinkResponse>.Failure("Validation failed", validationResults);
                }

                // Default URLs if not provided
                var successUrl = _config["PaymentSettings:SuccessUrl"] ?? $"http://localhost:5051/api/payments/payment-success?session_id={{CHECKOUT_SESSION_ID}}";
                var cancelUrl =  "https://yourdomain.com/payment-cancel";

                // Replace placeholder with actual Stripe placeholder
                successUrl = successUrl.Replace("{0}", "{CHECKOUT_SESSION_ID}");

                // Create session options
                var options = new SessionCreateOptions
                {
                    PaymentMethodTypes = new List<string> { "card" },
                    LineItems = new List<SessionLineItemOptions>
                    {
                        new SessionLineItemOptions
                        {
                            PriceData = new SessionLineItemPriceDataOptions
                            {
                                Currency = request.Currency,
                                UnitAmount = (long)(request.Amount * 100), // Convert to cents
                                ProductData = new SessionLineItemPriceDataProductDataOptions
                                {
                                    Name = request.UserId
                                }
                            },
                            Quantity = 1
                        }
                    },
                    Mode = "payment",
                    SuccessUrl = successUrl,
                    CancelUrl = cancelUrl
                };

                // Create Stripe checkout session
                var service = new SessionService();
                var session = await service.CreateAsync(options, cancellationToken: cancellationToken);


                // Calculate dollar value if not in USD
                decimal dollarValue;
                if (request.Currency.ToLower() == "usd")
                {
                    dollarValue = request.Amount;
                }
                else
                {
                    var exchangeRate = await GetExchangeRateAsync(request.Currency, "USD");
                    dollarValue = request.Amount * exchangeRate;
                }

                // Save to database
                var transaction = new PaymentTransaction
                {
                    Id = Guid.NewGuid(),
                    ReferenceNo = session.Id,
                    Amount = request.Amount,
                    DollarValue = dollarValue,
                    Status = "pending", // Initial status
                    ProviderRequest = JsonSerializer.Serialize(request),
                    ProviderResponse = JsonSerializer.Serialize(session),
                    Date = DateTime.UtcNow,
                    UserId = request.UserId,
                    CampaignId = request.CampaignId
                };

                await _paymentRepository.AddAsync(transaction);
                var response = new CreatePaymentLinkResponse
                {
                    SessionId = session.Id,
                    PaymentUrl = session.Url
                };

                return Result<CreatePaymentLinkResponse>.Success(response, "Payment link created successfully");
            }

            catch (Exception ex)
            {
                _logger.Error(ex, "Error during create payment link handler");
                return Result<CreatePaymentLinkResponse>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }

        private async Task<decimal> GetExchangeRateAsync(string fromCurrency, string toCurrency)
        {
            try
            {
                if (fromCurrency.Equals(toCurrency, StringComparison.OrdinalIgnoreCase))
                {
                    return 1m;
                }

                // Normalize currencies
                fromCurrency = fromCurrency.ToUpperInvariant();
                toCurrency = toCurrency.ToUpperInvariant();

                // Check cache first
                string cacheKey = $"ExchangeRate_{fromCurrency}_{toCurrency}";
                if (_cache.TryGetValue(cacheKey, out decimal cachedRate))
                {
                    _logger.Debug("Exchange rate found in cache for {FromCurrency} to {ToCurrency}: {Rate}",
                        fromCurrency, toCurrency, cachedRate);
                    return cachedRate;
                }

                // Fetch fresh data
                var response = await _httpClient.GetAsync($"{API_BASE_URL}{fromCurrency}");
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                _logger.Debug("Received exchange rate response: {Content}", content);

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var ratesData = JsonSerializer.Deserialize<ExchangeRateResponse>(content, options);

                if (ratesData?.Rates == null)
                {
                    _logger.Error("Exchange rate response does not contain rates data");
                    throw new Exception("Exchange rate data not available");
                }

                if (!ratesData.Rates.ContainsKey(toCurrency))
                {
                    _logger.Error("Target currency {Currency} not found in exchange rates", toCurrency);
                    throw new Exception($"Exchange rate not found for currency {toCurrency}");
                }

                decimal rate = ratesData.Rates[toCurrency];

                // Cache the result
                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromHours(CACHE_DURATION_HOURS))
                    .SetSlidingExpiration(TimeSpan.FromHours(1));

                _cache.Set(cacheKey, rate, cacheOptions);

                _logger.Information("Retrieved and cached exchange rate for {FromCurrency} to {ToCurrency}: {Rate}",
                    fromCurrency, toCurrency, rate);

                return rate;
            }
            catch (HttpRequestException ex)
            {
                _logger.Error(ex, "Error fetching exchange rate from API for {FromCurrency} to {ToCurrency}",
                    fromCurrency, toCurrency);
                throw new Exception("Unable to fetch exchange rate. Please try again later.", ex);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Unexpected error getting exchange rate for {FromCurrency} to {ToCurrency}",
                    fromCurrency, toCurrency);
                throw new Exception("An unexpected error occurred while getting the exchange rate.", ex);
            }
        }
        private class ExchangeRateResponse
        {
            public string Base { get; set; }
            public Dictionary<string, decimal> Rates { get; set; }
        }
    }
}