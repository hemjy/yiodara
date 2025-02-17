using MediatR;
using Serilog;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.Features.CampaignCategory.Command;
using Yiodara.Application.Interfaces.Cloudinary;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;

namespace Yiodara.Application.Features.Campaign.Command
{
    public class UpdateCampaignCommand : IRequest<Result<UpdateCampaignDto>>
    {
        [Required(ErrorMessage = "Id is required.")]
        public Guid Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public Guid CampaignCategoryId { get; set; }
        public string? Currency { get; set; }
        public double Amount { get; set; }
        public string? CoverImageBase64 { get; set; }  
        public List<string>? OtherImagesBase64 { get; set; }
        public List<string> ImagesToDelete { get; set; } = new List<string>();
    }

    public class UpdateCampaignDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public Guid CampaignCategoryId { get; set; }
        public string? Currency { get; set; }
        public double Amount { get; set; }
    }

    public class UpdateCampaignCommandHandler : IRequestHandler<UpdateCampaignCommand, Result<UpdateCampaignDto>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Campaign> _campaignRepository;
        private readonly ICloudinaryService _cloudinaryService;

        public UpdateCampaignCommandHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Campaign> campaignRepository,
            ICloudinaryService cloudinaryService)
        {
            _logger = logger;
            _campaignRepository = campaignRepository;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<Result<UpdateCampaignDto>> Handle(UpdateCampaignCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling updating campaign category handler");

                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);

                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);

                if (!isValid)
                {
                    _logger.Warning("Validation failed for /updating campaign category request: {ValidationResults}", validationResults);
                    return Result<UpdateCampaignDto>.Failure("failed", validationResults);
                }

                var campaignToBeEdited = await _campaignRepository.GetByAsync(t => t.Id == request.Id && !t.IsDeleted);

                if (campaignToBeEdited == null)
                {
                    return Result<UpdateCampaignDto>.Failure("This category does not exist");
                }

                campaignToBeEdited.Title = request.Title ?? campaignToBeEdited.Title;
                campaignToBeEdited.Description = request.Description ?? campaignToBeEdited.Description;
                campaignToBeEdited.Currency = request.Currency ?? campaignToBeEdited.Currency;
                campaignToBeEdited.Amount = request.Amount;
                campaignToBeEdited.CampaignCategoryId = request.CampaignCategoryId;
                campaignToBeEdited.LastModified = DateTime.UtcNow;

                // Handle cover image update
                if (!string.IsNullOrEmpty(request.CoverImageBase64))
                {
                    // Delete old cover image
                    if (!string.IsNullOrEmpty(campaignToBeEdited.CoverImage))
                    {
                        await _cloudinaryService.DeleteImageAsync(campaignToBeEdited.CoverImage);
                    }
                    // Upload new cover image
                    campaignToBeEdited.CoverImage = await _cloudinaryService.UploadBase64ImageAsync(request.CoverImageBase64);
                }

                // Handle other images
                var currentImages = campaignToBeEdited.OtherImages.ToList();

                // Delete requested images
                foreach (var imageUrl in request.ImagesToDelete)
                {
                    if (currentImages.Contains(imageUrl))
                    {
                        await _cloudinaryService.DeleteImageAsync(imageUrl);
                        currentImages.Remove(imageUrl);
                    }
                }

                // Add new images if any
                if (request.OtherImagesBase64?.Any() == true)
                {
                    var newImageUrls = await _cloudinaryService.UploadMultipleBase64ImagesAsync(request.OtherImagesBase64);
                    currentImages.AddRange(newImageUrls);
                }

                campaignToBeEdited.OtherImages = currentImages;

                await _campaignRepository.UpdateAsync(campaignToBeEdited, false);
                await _campaignRepository.SaveChangesAsync();

                var campaignCategory = new UpdateCampaignDto
                {
                    Title = campaignToBeEdited.Title,
                    Description = campaignToBeEdited.Description,
                    Amount = campaignToBeEdited.Amount,
                    CampaignCategoryId = campaignToBeEdited.CampaignCategoryId,
                    Currency = campaignToBeEdited.Currency
                };

                return Result<UpdateCampaignDto>.Success(campaignCategory, "Campaign updated successfully");
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during updating campaign");
                return Result<UpdateCampaignDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}