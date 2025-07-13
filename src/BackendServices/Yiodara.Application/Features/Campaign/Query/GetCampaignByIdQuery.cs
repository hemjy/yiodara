using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Yiodara.Application.Common;
using Yiodara.Application.Interfaces.Repositories;

namespace Yiodara.Application.Features.Campaign.Query
{
    public class GetCampaignByIdQuery : IRequest<Result<GetCampaignByIdDto>>
    {
        public Guid Id { get; set; }
    }

    public class GetCampaignByIdDto
    {
        public Guid Id { get; set; }
        public string? OrganizationName { get; set; }
        public string? CompanyProfile { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public CampaignCategoryDto? CampaignCategoryDto { get; set; }
        public string? Currency { get; set; }
        public double Amount { get; set; }
        public bool IsCompleted { get; set; } = false;
        public string? CoverImageBase64 { get; set; }
        public List<string> OtherImagesBase64 { get; set; } = new List<string>();
    }

    public class GetCampaignByIdQueryHandler : IRequestHandler<GetCampaignByIdQuery, Result<GetCampaignByIdDto>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Campaign> _campaignRepository;

        public GetCampaignByIdQueryHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Campaign> campaignRepository)
        {
            _logger = logger;
            _campaignRepository = campaignRepository;
        }

        public async Task<Result<GetCampaignByIdDto>> Handle(GetCampaignByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var campaign = await _campaignRepository.GetAllQuery()
                    .Include(x => x.CampaignCategory)
                    .FirstOrDefaultAsync(x => x.Id == request.Id && !x.IsDeleted, cancellationToken);

                if (campaign == null)
                {
                    return Result<GetCampaignByIdDto>.Failure($"Campaign with ID {request.Id} not found.");
                }

                var dto = new GetCampaignByIdDto
                {
                    Id = campaign.Id,
                    OrganizationName = campaign.OrganizationName,
                    CompanyProfile = campaign.CompanyProfile,
                    Title = campaign.Title,
                    Description = campaign.Description,
                    Amount = campaign.Amount,
                    Currency = campaign.Currency,
                    IsCompleted = campaign.IsCompleted,
                    CampaignCategoryDto = new CampaignCategoryDto
                    {
                        Id = campaign.CampaignCategory.Id,
                        Name = campaign.CampaignCategory.Name
                    },
                    CoverImageBase64 = campaign.CoverImage,
                    OtherImagesBase64 = campaign.OtherImages
                };

                return Result<GetCampaignByIdDto>.Success(dto);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error while getting campaign with ID {CampaignId}", request.Id);
                return Result<GetCampaignByIdDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}