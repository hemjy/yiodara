using MediatR;
using Microsoft.Extensions.Configuration;
using Serilog;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;
using Yiodara.Domain.Enums;

namespace Yiodara.Application.Features.Partner.Command
{
    public class CreatePartnerCommand : IRequest<Result<Guid>>
    {
        [Required(ErrorMessage = "Company name is required.")]
        [StringLength(100, ErrorMessage = "Company name cannot be longer than 100 characters.")]
        public string? CompanyName { get; set; }

        [StringLength(255, ErrorMessage = "Website URL cannot be longer than 255 characters.")]
        public string? WebsiteUrl { get; set; }

        [Required(ErrorMessage = "Industry is required.")]
        public Industry Industry { get; set; }

        [Required(ErrorMessage = "Company size is required.")]
        public CompanySize CompanySize { get; set; }

        [Required(ErrorMessage = "Full name is required.")]
        [StringLength(100, ErrorMessage = "Full name cannot be longer than 100 characters.")]
        public string? FullName { get; set; }

        [StringLength(100, ErrorMessage = "Job title cannot be longer than 100 characters.")]
        public string? JobTitle { get; set; }

        [Required(ErrorMessage = "Email address is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address format.")]
        [StringLength(100, ErrorMessage = "Email address cannot be longer than 100 characters.")]
        public string? EmailAddress { get; set; }

        [StringLength(20, ErrorMessage = "Phone number cannot be longer than 20 characters.")]
        public string? PhoneNumber { get; set; }

        [Required(ErrorMessage = "Campaign ID is required.")]
        public Guid CampaignId { get; set; }

        [Required(ErrorMessage = "Support provided is required.")]
        public SupportProvided SupportProvided { get; set; }

        [StringLength(500, ErrorMessage = "Contribution description cannot be longer than 500 characters.")]
        public string? HowDoesYourOrganizationAimToContribute { get; set; }

        [StringLength(500, ErrorMessage = "Impact description cannot be longer than 500 characters.")]
        public string? WhatImpactDoYouHopeToAchieve { get; set; }

        [StringLength(500, ErrorMessage = "Comments cannot be longer than 500 characters.")]
        public string? AnyOtherComments { get; set; }

        [Required(ErrorMessage = "Agreement to share provided info is required.")]
        public bool AgreeToShareProvidedInfo { get; set; }
    }

    public class CreatePartnerCommandHandler : IRequestHandler<CreatePartnerCommand, Result<Guid>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Partner> _partnerRepository;
        private readonly IGenericRepositoryAsync<Domain.Entities.Campaign> _campaignRepository;

        public CreatePartnerCommandHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Partner> partnerRepository,
            IGenericRepositoryAsync<Domain.Entities.Campaign> campaignRepository)
        {
            _logger = logger;
            _partnerRepository = partnerRepository;
            _campaignRepository = campaignRepository;
        }

        public async Task<Result<Guid>> Handle(CreatePartnerCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling creating partner handler");
                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);
                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);
                if (!isValid)
                {
                    _logger.Warning("Validation failed for creating partner request: {ValidationResults}", validationResults);
                    return Result<Guid>.Failure("failed", validationResults);
                }

                var partnerExists = await _partnerRepository
                                    .IsUniqueAsync(x => x.EmailAddress.Trim().ToLower() == request.EmailAddress.Trim().ToLower() && !x.IsDeleted);
                if (partnerExists)
                {
                    return Result<Guid>.Failure("Partner with this email already exists.");
                }

                // Check if campaign exists
                var campaignExists = await _campaignRepository
                                    .IsUniqueAsync(x => x.Id == request.CampaignId && !x.IsDeleted);
                if (!campaignExists)
                {
                    return Result<Guid>.Failure("Campaign does not exist.");
                }

                // Create a new partner
                var newPartner = Domain.Entities.Partner.Create(
                    request.CompanyName,
                    request.WebsiteUrl,
                    request.Industry,
                    request.CompanySize,
                    request.FullName,
                    request.JobTitle,
                    request.EmailAddress,
                    request.PhoneNumber,
                    request.CampaignId,
                    request.SupportProvided,
                    request.HowDoesYourOrganizationAimToContribute,
                    request.WhatImpactDoYouHopeToAchieve,
                    request.AnyOtherComments,
                    request.AgreeToShareProvidedInfo
                );

                await _partnerRepository.AddAsync(newPartner);
                return Result<Guid>.Success(newPartner.Id);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during creating partner");
                return Result<Guid>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}