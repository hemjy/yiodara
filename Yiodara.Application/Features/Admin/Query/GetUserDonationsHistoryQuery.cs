﻿using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.Interfaces.Repositories;

namespace Yiodara.Application.Features.Admin.Query
{
    public class GetUserDonationsHistoryQuery : IRequest<Result<UserDonationsDto>>
    {
        [Required]
        public string UserId { get; set; }
    }

    public class UserDonationsDto
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public decimal TotalDonations { get; set; }
        public string Currency { get; set; }
        public List<DonationDto> Donations { get; set; } = new List<DonationDto>();
    }

    public class DonationDto
    {
        public string CampaignName { get; set; }
        public string CampaignCategoryName { get; set; }
        public decimal Amount { get; set; }
        public DateTime DonationDate { get; set; }
    }

    public class GetUserDonationsHistoryQueryHandler : IRequestHandler<GetUserDonationsHistoryQuery, Result<UserDonationsDto>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.User> _userRepository;
        private readonly IGenericRepositoryAsync<Domain.Entities.PaymentTransaction> _paymentRepository;

        public GetUserDonationsHistoryQueryHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.User> userRepository,
            IGenericRepositoryAsync<Domain.Entities.PaymentTransaction> paymentRepository)
        {
            _logger = logger;
            _userRepository = userRepository;
            _paymentRepository = paymentRepository;
        }

        public async Task<Result<UserDonationsDto>> Handle(GetUserDonationsHistoryQuery request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Getting user donations for user ID: {UserId}", request.UserId);

                // Validate request
                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);
                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);
                if (!isValid)
                {
                    _logger.Warning("Validation failed for getting user donations: {ValidationResults}", validationResults);
                    return Result<UserDonationsDto>.Failure("Validation failed", validationResults);
                }

                // Get user information
                var user = await _userRepository.GetByIdAsync(request.UserId);
                if (user == null)
                {
                    _logger.Warning("User not found with ID: {UserId}", request.UserId);
                    return Result<UserDonationsDto>.Failure("User not found");
                }

                // Get all donations made by the user
                var userDonationsQuery = _paymentRepository.GetAllQuery();
                var userDonations = await userDonationsQuery
                    .Include(x => x.Campaign)
                        .ThenInclude(c => c.CampaignCategory)
                    .Where(x => x.UserId == request.UserId && !x.IsDeleted && x.Status.ToLower() == "paid")
                    .OrderByDescending(x => x.Created)
                    .ToListAsync(cancellationToken);

                // Calculate total donations
                decimal totalDonations = userDonations.Sum(x => x.Amount);

                // Prepare the response
                var result = new UserDonationsDto
                {
                    Username = user.UserName,
                    Email = user.Email,
                    TotalDonations = totalDonations,
                    // paginate donations
                    Donations = userDonations.Select(donation => new DonationDto
                    {
                        CampaignName = donation.Campaign.Title,
                        CampaignCategoryName = donation.Campaign.CampaignCategory.Name,
                        Amount = donation.Amount,
                        DonationDate = donation.Created
                    }).ToList()
                };

                return Result<UserDonationsDto>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error while getting donations for user ID: {UserId}", request.UserId);
                return Result<UserDonationsDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}
