using MediatR;
using Serilog;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.Common.Enums;
using Yiodara.Application.Interfaces.Cloudinary;
using Yiodara.Application.Interfaces.Repositories;

namespace Yiodara.Application.Features.Campaign.Command
{
    public class DeleteCampaignImageCommand : IRequest<Result<string>>
    {
        [Required(ErrorMessage = "Campaign Id is required.")]
        public Guid CampaignId { get; set; }

        [Required(ErrorMessage = "Image URL is required.")]
        public string ImageUrl { get; set; }

        [Required(ErrorMessage = "Image type must be specified.")]
        public ImageType ImageType { get; set; }
    }

    public class DeleteCampaignImageCommandHandler : IRequestHandler<DeleteCampaignImageCommand, Result<string>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Campaign> _campaignRepository;
        private readonly ICloudinaryService _cloudinaryService;

        public DeleteCampaignImageCommandHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Campaign> campaignRepository,
            ICloudinaryService cloudinaryService)
        {
            _logger = logger;
            _campaignRepository = campaignRepository;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<Result<string>> Handle(DeleteCampaignImageCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling delete campaign image request for Campaign ID: {CampaignId}, Image URL: {ImageUrl}",
                    request.CampaignId, request.ImageUrl);

                var campaign = await _campaignRepository.GetByAsync(t => t.Id == request.CampaignId && !t.IsDeleted);

                if (campaign == null)
                {
                    return Result<string>.Failure($"Campaign with ID {request.CampaignId} not found");
                }

                // Handle based on image type
                if (request.ImageType == ImageType.Cover)
                {
                    if (campaign.CoverImage != request.ImageUrl)
                    {
                        return Result<string>.Failure("Provided image URL does not match the campaign's cover image");
                    }

                    // Delete cover image from Cloudinary
                    await _cloudinaryService.DeleteImageAsync(request.ImageUrl);
                    campaign.CoverImage = null;
                }

                else // ImageType.Other
                {
                    if (!campaign.OtherImages.Contains(request.ImageUrl))
                    {
                        return Result<string>.Failure("Provided image URL not found in campaign's other images");
                    }

                    // Delete the image from Cloudinary
                    await _cloudinaryService.DeleteImageAsync(request.ImageUrl);
                    campaign.OtherImages.Remove(request.ImageUrl);
                }

                campaign.LastModified = DateTime.UtcNow;

                await _campaignRepository.UpdateAsync(campaign, false);
                await _campaignRepository.SaveChangesAsync();

                return Result<string>.Success("Campaign image deleted successfully");

            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during deleting campaign image for Campaign ID: {CampaignId}", request.CampaignId);
                return Result<string>.Failure($"An unexpected error occurred: {ex.Message}");
            }

        }
    }
}