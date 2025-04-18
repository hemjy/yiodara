using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System;
using System.Threading;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;
using Yiodara.Domain.Enums;

namespace Yiodara.Application.Features.Partner.Query
{
    public class GetPartnerByIdQuery : IRequest<Result<GetPartnerByIdDto>>
    {
        public Guid Id { get; set; }
    }

    public class GetPartnerByIdDto
    {
        public Guid Id { get; set; }
        public string CategoryName { get; set; }
        public DateTime DateSubmitted { get; set; }
        public string Status { get; set; } 
        public CompanyInformationDto CompanyInformation { get; set; }
        public ContactPersonDto ContactPerson { get; set; }
        public PartnershipDetailsDto PartnershipDetails { get; set; }
    }

    public class CompanyInformationDto
    {
        public string CompanyName { get; set; }
        public string WebsiteUrl { get; set; }
        public string Industry { get; set; }
        public string CompanySize { get; set; }
    }

    public class ContactPersonDto
    {
        public string FullName { get; set; }
        public string JobTitle { get; set; }
        public string EmailAddress { get; set; }
        public string PhoneNumber { get; set; }
    }

    public class PartnershipDetailsDto
    {
        public string SupportType { get; set; }
        public string CampaignInterested { get; set; }
        public string HowDoesYourOrganizationAimToContribute { get; set; }
        public string WhatImpactDoYouHopeToAchieve { get; set; }
        public string AnyOtherComments { get; set; }
    }

    public class GetPartnerByIdQueryHandler : IRequestHandler<GetPartnerByIdQuery, Result<GetPartnerByIdDto>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Partner> _partnerRepository;

        public GetPartnerByIdQueryHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Partner> partnerRepository)
        {
            _logger = logger;
            _partnerRepository = partnerRepository;
        }

        public async Task<Result<GetPartnerByIdDto>> Handle(GetPartnerByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var partner = await _partnerRepository.GetAllQuery()
                    .Include(p => p.Campaign)
                    .ThenInclude(c => c.CampaignCategory)
                    .FirstOrDefaultAsync(p => p.Id == request.Id && !p.IsDeleted, cancellationToken);

                if (partner == null)
                {
                    return Result<GetPartnerByIdDto>.Failure("Partner not found");
                }

                var dto = new GetPartnerByIdDto
                {
                    Id = partner.Id,
                    CategoryName = partner.Campaign.CampaignCategory.Name,
                    DateSubmitted = partner.Created,
                    Status = partner.Status.ToString(),

                    CompanyInformation = new CompanyInformationDto
                    {
                        CompanyName = partner.CompanyName,
                        WebsiteUrl = partner.WebsiteUrl,
                        Industry = partner.Industry.ToString(),
                        CompanySize = partner.CompanySize.ToString()
                    },

                    ContactPerson = new ContactPersonDto
                    {
                        FullName = partner.FullName,
                        JobTitle = partner.JobTitle,
                        EmailAddress = partner.EmailAddress,
                        PhoneNumber = partner.PhoneNumber
                    },

                    PartnershipDetails = new PartnershipDetailsDto
                    {
                        SupportType = partner.SupportProvided.ToString(),
                        CampaignInterested = partner.Campaign.Title,
                        HowDoesYourOrganizationAimToContribute = partner.HowDoesYourOrganizationAimToContribute,
                        WhatImpactDoYouHopeToAchieve = partner.WhatImpactDoYouHopeToAchieve,
                        AnyOtherComments = partner.AnyOtherComments
                    }
                };

                return Result<GetPartnerByIdDto>.Success(dto);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error getting partner with ID {PartnerId}", request.Id);
                return Result<GetPartnerByIdDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}