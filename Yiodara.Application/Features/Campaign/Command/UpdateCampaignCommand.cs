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
using Yiodara.Application.Helpers;
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
        public bool IsDraft { get; set; } = false;
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
        private readonly IGenericRepositoryAsync<Domain.Entities.CampaignCategory> _campaignCategoryRepo;
        private readonly ICloudinaryService _cloudinaryService;

        public UpdateCampaignCommandHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Campaign> campaignRepository,
            IGenericRepositoryAsync<Domain.Entities.CampaignCategory> campaignCategoryRepo,
            ICloudinaryService cloudinaryService)
        {
            _logger = logger;
            _campaignRepository = campaignRepository;
            _cloudinaryService = cloudinaryService;
            _campaignCategoryRepo = campaignCategoryRepo;
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

                if (!request.IsDraft)
                {
                    var fullCampaignErrors = new List<string>();

                    if (string.IsNullOrWhiteSpace(request.Title))
                        fullCampaignErrors.Add("Title is required for a published campaign.");
                    if (string.IsNullOrWhiteSpace(request.Description))
                        fullCampaignErrors.Add("Description is required for a published campaign.");
                    if (request.CampaignCategoryId == Guid.Empty)
                        fullCampaignErrors.Add("Campaign category is required for a published campaign.");
                    if (string.IsNullOrWhiteSpace(request.Currency))
                        fullCampaignErrors.Add("Currency is required for a published campaign.");
                    if (request.Amount <= 0)
                        fullCampaignErrors.Add("Amount must be greater than zero for a published campaign.");

                    if (fullCampaignErrors.Any())
                    {
                        _logger.Warning("Full campaign validation failed: {FullCampaignErrors}", fullCampaignErrors);
                        return Result<UpdateCampaignDto>.Failure("Validation failed for published campaign", fullCampaignErrors);
                    }
                }

                var campaignToBeEdited = await _campaignRepository.GetByAsync(t => t.Id == request.Id && !t.IsDeleted);

                if (campaignToBeEdited == null)
                {
                    return Result<UpdateCampaignDto>.Failure("This category does not exist");
                }

                if(request.CampaignCategoryId != Guid.Empty)
                {
                    var campaignCategoryExists = await _campaignCategoryRepo
                        .IsUniqueAsync(x => x.Id == request.CampaignCategoryId && !x.IsDeleted);
                    if (!campaignCategoryExists)
                    {
                        return Result<UpdateCampaignDto>.Failure("This category does not exist");
                    }
                }

                campaignToBeEdited.Title = request.Title.IsNotEmpty() ? request.Title.Trim() : campaignToBeEdited.Title;
                campaignToBeEdited.Description = request.Description.IsNotEmpty() ? request.Description.Trim() : campaignToBeEdited.Description;
                campaignToBeEdited.Currency = request.Currency.IsNotEmpty() ? request.Currency.Trim() : campaignToBeEdited.Currency;
                campaignToBeEdited.Amount = request.Amount != 0 ? request.Amount : campaignToBeEdited.Amount;
                campaignToBeEdited.CampaignCategoryId = request.CampaignCategoryId != Guid.Empty ? request.CampaignCategoryId : campaignToBeEdited.CampaignCategoryId;
                campaignToBeEdited.LastModified = DateTime.UtcNow;
                campaignToBeEdited.IsDraft = request.IsDraft;

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
                    if (request.OtherImagesBase64[0].IsNotEmpty())
                    {
                        var newImageUrls = await _cloudinaryService.UploadMultipleBase64ImagesAsync(request.OtherImagesBase64);
                        currentImages.AddRange(newImageUrls);
                    }
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