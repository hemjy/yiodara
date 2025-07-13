using MediatR;
using Serilog;
using System.ComponentModel.DataAnnotations;
using Yiodara.Application.Common;
using Yiodara.Application.Helpers;
using Yiodara.Application.Interfaces.Cloudinary;
using Yiodara.Application.Interfaces.Repositories;

namespace Yiodara.Application.Features.Campaign.Command
{
    public class UpdateCampaignCommand : IRequest<Result<UpdateCampaignDto>>
    {
        [Required(ErrorMessage = "Id is required.")]
        public Guid Id { get; set; }
        public string? OrganizationName { get; set; }
        public string? CompanyProfile { get; set; }
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
                _logger.Information("Handling updating campaign handler");

                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);

                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);

                if (!isValid)
                {
                    _logger.Warning("Validation failed for updating campaign request: {ValidationResults}", validationResults);
                    return Result<UpdateCampaignDto>.Failure("failed", validationResults);
                }

                if (request.IsDraft)
                {
                    // For draft, only validate if Title is provided and not empty
                    if (request.Title != null && string.IsNullOrWhiteSpace(request.Title))
                    {
                        validationResults.Add(new ValidationResult("Title cannot be empty.", new[] { nameof(request.Title) }));
                    }
                }
                else
                {
                    // For published campaigns, validate all required fields
                    if (string.IsNullOrWhiteSpace(request.Title))
                        validationResults.Add(new ValidationResult("Title is required.", new[] { nameof(request.Title) }));

                    if (string.IsNullOrWhiteSpace(request.Description))
                        validationResults.Add(new ValidationResult("Description is required.", new[] { nameof(request.Description) }));

                    if (request.CampaignCategoryId == Guid.Empty)
                        validationResults.Add(new ValidationResult("Category id is required.", new[] { nameof(request.CampaignCategoryId) }));

                    if (string.IsNullOrWhiteSpace(request.Currency))
                        validationResults.Add(new ValidationResult("Currency is required.", new[] { nameof(request.Currency) }));

                    if (string.IsNullOrWhiteSpace(request.OrganizationName))
                        validationResults.Add(new ValidationResult("Organization name is required.", new[] { nameof(request.OrganizationName) }));

                    if (request.Amount <= 0)
                        validationResults.Add(new ValidationResult("Amount is required and must be greater than 0.", new[] { nameof(request.Amount) }));

                    ValidationHelper.ValidateBase64Document(request.CompanyProfile, nameof(request.CoverImageBase64), validationResults);
                }

                if (validationResults.Any())
                {
                    _logger.Warning("Validation failed for updating campaign: {ValidationResults}", validationResults);
                    return Result<UpdateCampaignDto>.Failure("failed", validationResults);
                }

                var campaignToBeEdited = await _campaignRepository.GetByAsync(t => t.Id == request.Id && !t.IsDeleted);

                if (campaignToBeEdited == null)
                {
                    return Result<UpdateCampaignDto>.Failure("This campaign does not exist");
                }

                if (request.CampaignCategoryId != Guid.Empty)
                {
                    var campaignCategoryExists = await _campaignCategoryRepo
                        .IsUniqueAsync(x => x.Id == request.CampaignCategoryId && !x.IsDeleted);
                    if (!campaignCategoryExists)
                    {
                        return Result<UpdateCampaignDto>.Failure("This category does not exist");
                    }
                }

                // Update only the fields that are provided
                if (request.Title != null)
                    campaignToBeEdited.Title = request.Title.Trim();

                if (request.Description != null)
                    campaignToBeEdited.Description = request.Description.Trim();

                if (request.Currency != null)
                    campaignToBeEdited.Currency = request.Currency.Trim();

                if (request.Amount != 0)
                    campaignToBeEdited.Amount = request.Amount;

                if (request.CampaignCategoryId != Guid.Empty)
                    campaignToBeEdited.CampaignCategoryId = request.CampaignCategoryId;

                if (request.OrganizationName != null)
                    campaignToBeEdited.OrganizationName = request.OrganizationName.Trim();

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

                // Handle company profile document update
                if (!string.IsNullOrEmpty(request.CompanyProfile))
                {
                    try
                    {
                        _logger.Information("Updating company profile...");
                        campaignToBeEdited.CompanyProfile = await _cloudinaryService.UploadBase64DocumentAsync(request.CompanyProfile);
                    }
                    catch (Exception ex)
                    {
                        _logger.Error(ex, "Failed to upload company profile document.");
                        return Result<UpdateCampaignDto>.Failure("Failed to upload company profile document. Please ensure the file is a valid base64-encoded document and less than 10MB.");
                    }
                }

                await _campaignRepository.UpdateAsync(campaignToBeEdited, false);
                await _campaignRepository.SaveChangesAsync();

                var updatedCampaign = new UpdateCampaignDto
                {
                    Title = campaignToBeEdited.Title,
                    Description = campaignToBeEdited.Description,
                    Amount = campaignToBeEdited.Amount,
                    CampaignCategoryId = campaignToBeEdited.CampaignCategoryId,
                    Currency = campaignToBeEdited.Currency
                };

                return Result<UpdateCampaignDto>.Success(updatedCampaign, "Campaign updated successfully");
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during updating campaign");
                return Result<UpdateCampaignDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}